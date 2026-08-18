import { APIRequestContext, request } from '@playwright/test';
import { API_BASE_URL } from '../config/env';

export class ApiClient {
  private requestContext!: APIRequestContext;
  private baseUrl = API_BASE_URL;
  private token = '';

  constructor(baseUrl?: string) {
    this.baseUrl = `${(baseUrl ?? this.baseUrl).replace(/\/+$/, '')}/`;
  }

  setToken(token?: string) {
    this.token = token ?? '';
  }

  private authHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  async init() {
    this.requestContext = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: this.authHeaders(),
    });
  }

  async login(username: string, password: string) {
    if (!this.requestContext) await this.init();
    const response = await this.requestContext!.post('auth/login', {
      data: { username, password },
    });
    const payload = await response.json().catch(() => ({}));
    this.token = payload.token ?? payload.data?.token ?? this.token;
    return response;
  }

  async getProducts() {
    return this.requestContext!.get('products', { headers: this.authHeaders() });
  }

  async getCart() {
    return this.requestContext.get('cart', { headers: this.authHeaders() });
  }

  async updateCart(cart: unknown) {
    return this.requestContext.put('cart', { data: cart, headers: this.authHeaders() });
  }

  async clearCart() {
    return this.updateCart({ items: [] });
  }

  async createOrder(order: unknown) {
    return this.requestContext.post('orders', { data: order, headers: this.authHeaders() });
  }

  async getOrders() {
    return this.requestContext.get('orders', { headers: this.authHeaders() });
  }

  async getProfile(): Promise<{ name: string; [key: string]: unknown }> {
    const response = await this.requestContext.get('profile', { headers: this.authHeaders() });
    const body = await response.json().catch(() => ({}));
    // Support both flat { name } and nested { data: { name } } shapes
    return body.data ?? body;
  }

  /** Raw APIResponse — kept for tests that need to assert status codes. */
  async getProfileRaw() {
    return this.requestContext.get('profile', { headers: this.authHeaders() });
  }

  async updateProfile(payload: unknown) {
    return this.requestContext.patch('profile', { data: payload, headers: this.authHeaders() });
  }

  /** Convenience wrapper used by the profile cleanup fixture. */
  async updateName(name: string) {
    return this.updateProfile({ name });
  }

  async dispose() {
    await this.requestContext.dispose();
  }
}
