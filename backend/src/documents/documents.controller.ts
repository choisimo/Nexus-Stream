import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createDocumentDto: CreateDocumentDto) {
    // Create document with real user ID from JWT
    return this.documentsService.create(req.user.sub, createDocumentDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('published') published?: string,
  ) {
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (published !== undefined) {
      where.isPublished = published === 'true';
    }

    return this.documentsService.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
    });
  }

  @Get('search')
  search(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    return this.documentsService.search(query);
  }

  @Get('category/:categoryId')
  getByCategory(@Param('categoryId') categoryId: string) {
    return this.documentsService.getByCategory(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Get(':id/versions')
  getVersionHistory(@Param('id') id: string) {
    return this.documentsService.getVersionHistory(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    // Update with real user ID from JWT
    return this.documentsService.update(id, req.user.sub, updateDocumentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    // Delete with real user ID from JWT
    return this.documentsService.remove(id, req.user.sub);
  }
}
