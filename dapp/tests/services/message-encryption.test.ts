import {describe, expect} from '@jest/globals';

import {
    deriveKeypairFromSeed,
    generateRandomBabyJubValue,
} from '../../src/lib/keychain';
import {} from '../../src/lib/message-encryption';
import {
    CIPHERTEXT_MSG_SIZE,
    decryptRandomSecret,
    encryptRandomSecret,
    PACKED_PUB_KEY_SIZE,
    sliceCipherMsg,
} from '../../src/services/message-encryption';

describe('Random secret encryption', () => {
    const rootReadingKeypair = deriveKeypairFromSeed();
    const randomSecret = generateRandomBabyJubValue();

    const ciphertext = encryptRandomSecret(
        randomSecret,
        rootReadingKeypair.publicKey,
    );

    const [packedEphemeralPubKey, cipheredText] = sliceCipherMsg(ciphertext);

    const decrypted = decryptRandomSecret(
        ciphertext,
        rootReadingKeypair.privateKey,
    );

    it('should be decrypted and have correct message', () => {
        expect(decrypted).toEqual(randomSecret);
    });

    it('should have size of 64 bytes', () => {
        expect(ciphertext.length).toEqual(
            (PACKED_PUB_KEY_SIZE + CIPHERTEXT_MSG_SIZE) * 2, // 64 bytes
        );
    });

    it('should have a ciphertext of size 32 bytes', () => {
        expect(cipheredText.length).toEqual(CIPHERTEXT_MSG_SIZE); // 32 bytes
    });

    it('should have a packedEphemeralPubKey of size 32 bytes', () => {
        expect(packedEphemeralPubKey.length).toEqual(PACKED_PUB_KEY_SIZE); // 32 bytes
    });
});
