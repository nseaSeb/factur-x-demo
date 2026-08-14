import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Link } from './resource.interface';

interface InvoiceLinks {
  self: Link;
  pdf: Link;
  validation: Link;
  collection: Link;
}

interface ProductLinks {
  self: Link;
  update: Link;
  delete: Link;
  collection: Link;
}

interface CollectionLinks {
  self: Link;
  next?: Link;
  prev?: Link;
}

/**
 * Builds absolute hypermedia links from a configurable base URL rather than
 * request headers, so Swagger examples and any e2e assertions stay
 * deterministic regardless of how the request arrived.
 */
@Injectable()
export class HateoasService {
  private readonly baseUrl: string;

  constructor(configService: ConfigService) {
    this.baseUrl = (
      configService.get<string>('APP_BASE_URL') ?? 'http://localhost:3200'
    ).replace(/\/$/, '');
  }

  invoiceLinks(id: string): InvoiceLinks {
    return {
      self: { href: `${this.baseUrl}/invoices/${id}`, method: 'GET' },
      pdf: { href: `${this.baseUrl}/invoices/${id}/pdf`, method: 'GET' },
      validation: { href: `${this.baseUrl}/invoices/validate`, method: 'POST' },
      collection: { href: `${this.baseUrl}/invoices`, method: 'GET' },
    };
  }

  productLinks(id: string): ProductLinks {
    return {
      self: { href: `${this.baseUrl}/products/${id}`, method: 'GET' },
      update: { href: `${this.baseUrl}/products/${id}`, method: 'PATCH' },
      delete: { href: `${this.baseUrl}/products/${id}`, method: 'DELETE' },
      collection: { href: `${this.baseUrl}/products`, method: 'GET' },
    };
  }

  collectionLinks(
    resourcePath: string,
    page: number,
    limit: number,
    total: number,
  ): CollectionLinks {
    const lastPage = Math.max(1, Math.ceil(total / limit));
    const links: CollectionLinks = {
      self: {
        href: `${this.baseUrl}${resourcePath}?page=${page}&limit=${limit}`,
        method: 'GET',
      },
    };
    if (page > 1) {
      links.prev = {
        href: `${this.baseUrl}${resourcePath}?page=${page - 1}&limit=${limit}`,
        method: 'GET',
      };
    }
    if (page < lastPage) {
      links.next = {
        href: `${this.baseUrl}${resourcePath}?page=${page + 1}&limit=${limit}`,
        method: 'GET',
      };
    }
    return links;
  }
}
