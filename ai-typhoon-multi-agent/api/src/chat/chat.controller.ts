import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { FALLBACK_MESSAGE } from '../common/constants';

@Controller('api')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  async chat(
    @Body() body: { message: string; sessionId?: string },
    @Res() res: Response,
  ): Promise<void> {
    const { message, sessionId = 'default' } = body ?? {};
    if (!message || typeof message !== 'string') {
      throw new HttpException(
        { error: 'message is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const sendChunk = (text: string) => {
      res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
    };

    try {
      const stream = this.chatService.processMessage(message, sessionId);
      for await (const chunk of stream) {
        sendChunk(chunk);
      }
    } catch (err) {
      console.error('Chat error:', err);
      sendChunk(FALLBACK_MESSAGE);
    } finally {
      res.end();
    }
  }

  @Get('voc/analytics')
  async getVocAnalytics() {
    return this.chatService.getAnalytics();
  }
}
