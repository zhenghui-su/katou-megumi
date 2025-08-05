import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MusicService } from './music.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { Music } from '../../entities/Music';
import { AdminGuard } from '../../guards/admin.guard';

@ApiTags('music')
@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new music (Admin only)' })
  @ApiResponse({ status: 201, description: 'Music created successfully', type: Music })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createMusicDto: CreateMusicDto): Promise<Music> {
    return await this.musicService.create(createMusicDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all music' })
  @ApiResponse({ status: 200, description: 'List of all music', type: [Music] })
  async findAll(@Query('category') category?: string): Promise<Music[]> {
    if (category) {
      return await this.musicService.findByCategory(category);
    }
    return await this.musicService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get music by ID' })
  @ApiResponse({ status: 200, description: 'Music found', type: Music })
  @ApiResponse({ status: 404, description: 'Music not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Music> {
    return await this.musicService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update music (Admin only)' })
  @ApiResponse({ status: 200, description: 'Music updated successfully', type: Music })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Music not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMusicDto: UpdateMusicDto,
  ): Promise<Music> {
    return await this.musicService.update(id, updateMusicDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete music (Admin only)' })
  @ApiResponse({ status: 200, description: 'Music deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Music not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.musicService.remove(id);
  }
}