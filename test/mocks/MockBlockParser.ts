import { IBlockParser } from '../../src/interfaces/IBlockParser';
import { BlockParserResult } from '../../src/types/services';

export class MockBlockParser implements IBlockParser {
  private parsedBlocks!: any[];
  private id: number;

  constructor() {
    this.id = Math.floor(Math.random() * 1000000);
    this.parsedBlocks = [];
  }

  injectParsedBlocks(blocks: any[]): void {
    this.parsedBlocks = blocks || [];
  }

  findParsedFieldsByHeight(height: number): any | undefined {
    for(let i = 0; i < this.parsedBlocks.length; i++) {
      const block = this.parsedBlocks[i];
      if(block.blockHeight === height) {
        return block;
      }
    }

    return undefined;
  }

  apply(block: any): BlockParserResult {
    if(!!block && !!block.block && !!block.block.header && !!block.block.header.height) {
      const height = block.block.header.height;
      const parsedFields = this.findParsedFieldsByHeight(height);

      return {
        success: !!parsedFields,
        height: height,
        fields: parsedFields
      };
    }

    return { success: false }
  }
}
