import { IBlockchain } from '../../src/interfaces/IBlockchain';
import { GetBlockResult } from '../../src/types/lib';
import { settings } from '../../src/config/settings';

export class MockCasperBlockchain implements IBlockchain {
  private blocks!: any[];
  private id: number;
  private mode!: any;

  constructor() {
    this.id = Math.floor(Math.random() * 1000000);
    this.mode = {}
    this.activateSuccessOnlyMode('getBlockByHeight');
    this.activateSuccessOnlyMode('getCurrentBlockHeight');
  }

  activateSuccessOnlyMode(functionName: string): void {
    this.mode[functionName] = 'success';
  }

  activateFailureOnlyMode(functionName: string): void {
    this.mode[functionName] = 'failure';
  }

  activateRandomizeMode(functionName: string): void {
    this.mode[functionName] = 'random';
  }

  getSuccess(functionName: string): boolean {
    if(this.mode[functionName] === 'success') {
      return true;
    } else if(this.mode[functionName] === 'failure') {
      return false;
    }

    const value = Math.random();
    return value > 0.2;
  }

  injectBlocks(blocks: any[]): void {
    this.blocks = blocks || [];
  }

  getMaxBlockHeight(): number {
    let max = 0;

    this.blocks.forEach((block) => {
      if(!!block && !!block.block && !!block.block.header && !!block.block.header.height) {
        const blockHeight = block.block.header.height;

        if(blockHeight > max) {
          max = blockHeight;
        }
      }
    });

    return max;
  }

  async getBlockByHeight(height: number): Promise<GetBlockResult> {
    if(this.getSuccess('getBlockByHeight')) {
      if(!!this.blocks) {
        for(let i = 0; i < this.blocks.length; i++) {
          const block = this.blocks[i];

          if(!!block && !!block.block && !!block.block.header && !!block.block.header.height) {
            const blockHeight = block.block.header.height;

            if(parseInt(blockHeight) === height) {
              return { success: true, block: block, height: height }
            }
          }
        }
      }

      return { success: false, error: 'Block not found', height: height }
    }

    return { success: false }
  }

  async getCurrentBlockHeight(): Promise<number | undefined> {
    if(this.getSuccess('getCurrentBlockHeight')) {
      if(!!this.blocks && this.blocks.length > 0) {
        return this.getMaxBlockHeight();
      }
    }

    return undefined;
  }
}

export class MockCasperBlockchainV2 extends MockCasperBlockchain {
  private enabled: boolean = true;

  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }

  async getCurrentBlockHeight(): Promise<number | undefined> {
    if(this.enabled) {
      const currentBlockHeight = await super.getCurrentBlockHeight();
      const confirmations = parseInt(settings.blockchain.blockchainConfirmations);
      return <number>(currentBlockHeight) + confirmations;
    }

    return undefined;
  }
}
