import { Injectable } from '@nestjs/common';
import { CrashRepository } from './crash.repository';

@Injectable()
export class CrashService {
  constructor(private readonly crashRepository: CrashRepository) {}
  /**
   * Create a crash.
   * @param exception - The exception message.
   * @param stack - The stack trace.
   */
  async createCrash(exception: string, stack: string): Promise<void> {
    await this.crashRepository.createCrash(exception, stack);
  }
}
