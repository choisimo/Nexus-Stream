import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDocumentDto: CreateDocumentDto) {
    try {
      // Extract tags from DTO
      const { tags, ...documentData } = createDocumentDto;
      
      // Create document with real database connection
      const document = await this.prisma.document.create({
        data: {
          ...documentData,
          authorId: userId,
          tags: tags ? {
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })),
          } : undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
          tags: true,
        },
      });

      return document;
    } catch (error) {
      console.error('Create document error:', error);
      throw new BadRequestException('Failed to create document');
    }
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DocumentWhereInput;
    orderBy?: Prisma.DocumentOrderByWithRelationInput;
  }) {
    try {
      const { skip = 0, take = 10, where, orderBy } = params;
      
      // Real database query with pagination
      const [documents, total] = await Promise.all([
        this.prisma.document.findMany({
          skip,
          take,
          where,
          orderBy: orderBy || { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: true,
            tags: true,
            _count: {
              select: {
                comments: true,
                versions: true,
              },
            },
          },
        }),
        this.prisma.document.count({ where }),
      ]);

      return {
        data: documents,
        meta: {
          total,
          page: Math.floor(skip / take) + 1,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      console.error('Find documents error:', error);
      throw new BadRequestException('Failed to fetch documents');
    }
  }

  async findOne(id: string) {
    try {
      // Real database query
      const document = await this.prisma.document.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: {
                select: {
                  avatar: true,
                  department: true,
                  position: true,
                },
              },
            },
          },
          category: true,
          tags: true,
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          versions: {
            orderBy: { version: 'desc' },
            take: 5,
          },
        },
      });

      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }

      // Increment view count (real update)
      await this.prisma.document.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      return document;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Find document error:', error);
      throw new BadRequestException('Failed to fetch document');
    }
  }

  async update(id: string, userId: string, updateDocumentDto: UpdateDocumentDto) {
    try {
      // Check if document exists and user is author
      const existingDocument = await this.prisma.document.findUnique({
        where: { id },
        select: { authorId: true, version: true, content: true },
      });

      if (!existingDocument) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }

      if (existingDocument.authorId !== userId) {
        throw new BadRequestException('You can only edit your own documents');
      }

      const { tags, changelog, ...updateData } = updateDocumentDto;

      // Create version history if content changed
      if (updateData.content && updateData.content !== existingDocument.content) {
        await this.prisma.documentVersion.create({
          data: {
            documentId: id,
            content: existingDocument.content,
            version: existingDocument.version,
            changelog: changelog || 'No changelog provided',
            createdBy: userId,
          },
        });
      }

      // Update document in real database
      const document = await this.prisma.document.update({
        where: { id },
        data: {
          ...updateData,
          version: updateData.content ? { increment: 1 } : undefined,
          tags: tags ? {
            set: [],
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })),
          } : undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
          tags: true,
        },
      });

      return document;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Update document error:', error);
      throw new BadRequestException('Failed to update document');
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Check if document exists and user is author
      const document = await this.prisma.document.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }

      if (document.authorId !== userId) {
        throw new BadRequestException('You can only delete your own documents');
      }

      // Delete from real database (cascade delete will handle related records)
      await this.prisma.document.delete({
        where: { id },
      });

      return { message: 'Document deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Delete document error:', error);
      throw new BadRequestException('Failed to delete document');
    }
  }

  async search(query: string) {
    try {
      // Real database search
      const documents = await this.prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
          ],
          isPublished: true,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
          tags: true,
        },
        orderBy: { viewCount: 'desc' },
        take: 20,
      });

      return documents;
    } catch (error) {
      console.error('Search documents error:', error);
      throw new BadRequestException('Failed to search documents');
    }
  }

  async getByCategory(categoryId: string) {
    try {
      // Check if category exists
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Get documents from real database
      const documents = await this.prisma.document.findMany({
        where: { categoryId, isPublished: true },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        category,
        documents,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Get documents by category error:', error);
      throw new BadRequestException('Failed to fetch documents by category');
    }
  }

  async getVersionHistory(documentId: string) {
    try {
      // Check if document exists
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        select: { id: true, title: true },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Get version history from real database
      const versions = await this.prisma.documentVersion.findMany({
        where: { documentId },
        orderBy: { version: 'desc' },
      });

      return {
        document,
        versions,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Get version history error:', error);
      throw new BadRequestException('Failed to fetch version history');
    }
  }
}
