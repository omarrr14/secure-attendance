import api from '../lib/axios';
import type { MockFidoRegisterRequest, MockFidoRegisterResponse, MockFidoLoginRequest } from '../types';

export const mockFidoService = {
    register: async (data: MockFidoRegisterRequest) => {
        const response = await api.post<MockFidoRegisterResponse>('/mock-fido/register', data);
        return response.data;
    },

    login: async (data: MockFidoLoginRequest) => {
        const response = await api.post<{ token: string }>('/mock-fido/login', data);
        return response.data;
    }
};
