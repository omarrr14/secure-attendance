import api from '../lib/axios';
import { base64urlToBuffer, bufferToBase64url } from '../lib/webauthnUtils';

// Types aligning with Fido2NetLib
export interface CredentialCreateOptionsResponse {
    rp: PublicKeyCredentialRpEntity;
    user: PublicKeyCredentialUserEntity;
    challenge: string; // Base64URL
    pubKeyCredParams: PublicKeyCredentialParameters[];
    timeout?: number;
    excludeCredentials?: PublicKeyCredentialDescriptor[];
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    attestation?: AttestationConveyancePreference;
    extensions?: AuthenticationExtensionsClientInputs;
}

export interface CredentialAssertionOptionsResponse {
    challenge: string; // Base64URL
    timeout?: number;
    rpId?: string;
    allowCredentials?: PublicKeyCredentialDescriptor[];
    userVerification?: UserVerificationRequirement;
    extensions?: AuthenticationExtensionsClientInputs;
}

export const fidoService = {
    // Check registration status
    checkRegistrationStatus: async (userId: string): Promise<{ hasRegistered: boolean }> => {
        const response = await api.get(`/fido/registration-status/${userId}`);
        return response.data;
    },

    // REGISTRATION
    register: async (userId: string, displayName: string) => {
        // 1. Get Options
        const optionsRes = await api.post<CredentialCreateOptionsResponse>('/fido/makeCredentialOptions', {
            userId,
            displayName
        });
        const options = optionsRes.data;

        // 2. Prepare for navigator.credentials.create
        const publicKey: PublicKeyCredentialCreationOptions = {
            ...options,
            challenge: base64urlToBuffer(options.challenge),
            user: {
                ...options.user,
                id: base64urlToBuffer(options.user.id as any) // Backend sends Base64, we need Buffer
            },
            excludeCredentials: options.excludeCredentials?.map(c => ({
                ...c,
                id: base64urlToBuffer(c.id as any)
            }))
        };

        // 3. Create Credential
        const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
        if (!credential) throw new Error("Credential creation failed");

        const attestationResponse = credential.response as AuthenticatorAttestationResponse;

        // 4. Send to Backend
        // We need to send the raw generic object, but with ArrayBuffers converted back to Base64URL strings
        // Fido2NetLib expects specific structure. 
        // Ideally we send the "Raw" data.

        const makeCredentialRequest = {
            userId,
            attestationResponse: {
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    attestationObject: bufferToBase64url(attestationResponse.attestationObject),
                    clientDataJSON: bufferToBase64url(attestationResponse.clientDataJSON)
                }
            }
        };

        const result = await api.post('/fido/makeCredential', makeCredentialRequest);
        return result.data;
    },

    // LOGIN
    login: async (userId: string) => {
        // 1. Get Options
        const optionsRes = await api.post<CredentialAssertionOptionsResponse>('/fido/assertionOptions', { userId });
        const options = optionsRes.data;

        // 2. Prepare for navigator.credentials.get
        const publicKey: PublicKeyCredentialRequestOptions = {
            ...options,
            challenge: base64urlToBuffer(options.challenge),
            allowCredentials: options.allowCredentials?.map(c => ({
                ...c,
                id: base64urlToBuffer(c.id as any)
            }))
        };

        // 3. Get Assertion
        const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
        if (!credential) throw new Error("Authentication failed");

        const assertionResponse = credential.response as AuthenticatorAssertionResponse;

        // 4. Send to Backend
        const makeAssertionRequest = {
            userId,
            assertionResponse: {
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    authenticatorData: bufferToBase64url(assertionResponse.authenticatorData),
                    clientDataJSON: bufferToBase64url(assertionResponse.clientDataJSON),
                    signature: bufferToBase64url(assertionResponse.signature),
                    userHandle: assertionResponse.userHandle ? bufferToBase64url(assertionResponse.userHandle) : null
                }
            }
        };

        const result = await api.post<{ token: string }>('/fido/makeAssertion', makeAssertionRequest);
        return result.data;
    }
};

