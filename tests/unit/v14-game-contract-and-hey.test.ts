import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  encodeVaultGetPlayerSummaryCalldata,
  encodeVaultRecordMatchCalldata,
} from '../../src/tokenomics/wallet.js';
// @ts-expect-error ESM module shared with production server
import { buildVaultRegisterMessage, createWalletRegistry, signPersonalMessage } from '../../scripts/wallet-registry.mjs';
// @ts-expect-error ESM module shared with production server
import { VAULT_CONTRACT_METADATA, VAULT_CREATION_TX_DATA_MAINNET, VAULT_EXPECTED_MAINNET_RUNTIME_HEX } from '../../scripts/contract-artifact.mjs';
// @ts-expect-error ESM module shared with production server
import { renderDeployStudioHtml, renderDynamicIndexHtml, renderUpdatesHtml } from '../../scripts/ship-updates.mjs';

describe('v1.4 Game Contract (RobinTownHarborVault), Deploy Studio & HEY Corroboration', () => {
  it('encodes recordHarborMatch (0xfa9e6186) and getPlayerSummary (0xdc96d5fc) accurately', () => {
    const matchCalldata = encodeVaultRecordMatchCalldata(20261102, 840, 3);
    assert.ok(matchCalldata.startsWith('0xfa9e6186'));
    assert.equal(matchCalldata.length, 2 + 8 + 64 * 3);
    assert.ok(matchCalldata.includes((20261102).toString(16).padStart(64, '0')));
    assert.ok(matchCalldata.includes((840).toString(16).padStart(64, '0')));

    const summaryCalldata = encodeVaultGetPlayerSummaryCalldata(
      '0x14791697260E4c9A71f18484C9f997B308e59325',
    );
    assert.equal(
      summaryCalldata,
      '0xdc96d5fc00000000000000000000000014791697260e4c9a71f18484c9f997b308e59325',
    );
  });

  it('verifies compiled RobinTownHarborVault bytecode, owner signature registration, and gas-only match tx receipts', async () => {
    assert.equal(VAULT_CONTRACT_METADATA.contractName, 'RobinTownHarborVault');
    assert.equal(VAULT_CONTRACT_METADATA.tokenName, 'Robin Town');
    assert.equal(VAULT_CONTRACT_METADATA.tokenSymbol, 'RTOWN');
    assert.equal(VAULT_CONTRACT_METADATA.chainId, 4663);
    assert.ok(/^0x60[0-9a-f]+5173b8ea6923c2d40267890d45c46a3480954773$/.test(VAULT_CREATION_TX_DATA_MAINNET));

    const tmpStore = path.join(os.tmpdir(), `rtown-v14-${Date.now()}.json`);
    const ownerPrivKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    const strangerPrivKey = '0x9999999999999999999999999999999999999999999999999999999999999999';
    const deployedVault = '0xAbCdEf0123456789aBcDeF0123456789AbCdEf01';
    const regMsg = buildVaultRegisterMessage(deployedVault);
    const ownerSigned = signPersonalMessage(regMsg, ownerPrivKey);
    const strangerSigned = signPersonalMessage(regMsg, strangerPrivKey);

    try {
      const registry = createWalletRegistry({
        storePath: tmpStore,
        fetchBalanceFn: async () => 250,
        fetchCodeFn: async (addr: string) =>
          addr.toLowerCase() === deployedVault.toLowerCase()
            ? VAULT_EXPECTED_MAINNET_RUNTIME_HEX
            : '0x60006000fd',
        fetchOwnerFn: async () => ownerSigned.address,
        fetchReceiptFn: async (txHash: string) => ({
          transactionHash: txHash,
          status: '0x1',
          from: strangerSigned.address,
          to: deployedVault,
          logs: [],
        }),
      });

      // Rejects registration signed by non-owner
      await assert.rejects(
        () =>
          registry.registerVaultContract({
            contractAddress: deployedVault,
            signature: strangerSigned.signature,
          }),
        /owner\(\) wallet/i,
      );

      // Rejects registration when bytecode does not match RobinTownHarborVault
      const fakeVault = '0x2222222222222222222222222222222222222222';
      const fakeSigned = signPersonalMessage(buildVaultRegisterMessage(fakeVault), ownerPrivKey);
      await assert.rejects(
        () =>
          registry.registerVaultContract({
            contractAddress: fakeVault,
            signature: fakeSigned.signature,
          }),
        /bytecode/i,
      );

      // Accepts valid owner signature + exact runtime bytecode match
      const registered = await registry.registerVaultContract({
        contractAddress: deployedVault,
        txHash: '0x' + 'a'.repeat(64),
        signature: ownerSigned.signature,
      });
      assert.equal(registered.ok, true);
      assert.equal(registered.vaultContractAddress, deployedVault);
      assert.equal(
        registered.explorerUrl,
        `https://robinhoodchain.blockscout.com/address/${deployedVault}`,
      );

      // Credits gas-only recordHarborMatch interaction on the registered vault contract
      const matchTxRes = await registry.verifyOnChainWifTx({
        address: strangerSigned.address,
        txHash: '0x' + 'b'.repeat(64),
      });
      assert.equal(matchTxRes.txVerified, true);
      assert.equal(matchTxRes.onChainPatronBoost, true);
      assert.equal(matchTxRes.bonusTownPoints, 150);
    } finally {
      try {
        fs.unlinkSync(tmpStore);
      } catch {}
    }
  });

  it('injects Blockscout contract links into /, /updates, and /deploy with zero prose dashes', () => {
    const vaultInfo = {
      vaultContractAddress: '0xAbCdEf0123456789aBcDeF0123456789AbCdEf01',
      explorerUrl:
        'https://robinhoodchain.blockscout.com/address/0xAbCdEf0123456789aBcDeF0123456789AbCdEf01',
    };
    const baseIndex = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    const ssrHome = renderDynamicIndexHtml(
      baseIndex,
      '/',
      'https://harbor-tycoon-production.up.railway.app',
      vaultInfo,
    );
    assert.ok(ssrHome.includes(vaultInfo.explorerUrl));

    const updatesHtml = renderUpdatesHtml(vaultInfo);
    assert.ok(updatesHtml.includes('v1.4.0'));
    assert.ok(updatesHtml.includes(vaultInfo.explorerUrl));
    assert.ok(!updatesHtml.includes('—') && !updatesHtml.includes('–'));

    const deployHtml = renderDeployStudioHtml(vaultInfo);
    assert.ok(deployHtml.includes('heyresearch.xyz/submit'));
    assert.ok(deployHtml.includes('RTOWN'));
    assert.ok(deployHtml.includes(vaultInfo.vaultContractAddress));

    const dockerfile = fs.readFileSync(path.resolve(process.cwd(), 'Dockerfile'), 'utf8');
    assert.ok(
      dockerfile.includes('scripts/contract-artifact.mjs'),
      'Dockerfile runner stage must copy scripts/contract-artifact.mjs',
    );
  });
});
