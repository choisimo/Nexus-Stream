import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, MinLength } from 'class-validator';

export enum DocumentType {
  ARTICLE = 'ARTICLE',
  GUIDE = 'GUIDE',
  FAQ = 'FAQ',
  POLICY = 'POLICY',
  TEMPLATE = 'TEMPLATE',
  REPORT = 'REPORT',
}

export class CreateDocumentDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
