import { ConfigService } from '@nestjs/config';
import { HateoasService } from './hateoas.service';

describe('HateoasService', () => {
  const hateoas = new HateoasService({
    get: () => 'http://api.test/',
  } as unknown as ConfigService);

  describe('collectionLinks', () => {
    it('builds page links without filters', () => {
      const links = hateoas.collectionLinks('/invoices', 2, 10, 30);

      expect(links).toEqual({
        self: {
          href: 'http://api.test/invoices?page=2&limit=10',
          method: 'GET',
        },
        prev: {
          href: 'http://api.test/invoices?page=1&limit=10',
          method: 'GET',
        },
        next: {
          href: 'http://api.test/invoices?page=3&limit=10',
          method: 'GET',
        },
      });
    });

    it('carries filters into every page link', () => {
      const links = hateoas.collectionLinks('/invoices', 2, 1, 3, {
        number: 'FA 2026/001',
      });

      expect(links.self.href).toBe(
        'http://api.test/invoices?number=FA+2026%2F001&page=2&limit=1',
      );
      expect(links.prev?.href).toBe(
        'http://api.test/invoices?number=FA+2026%2F001&page=1&limit=1',
      );
      expect(links.next?.href).toBe(
        'http://api.test/invoices?number=FA+2026%2F001&page=3&limit=1',
      );
    });

    it('omits prev and next on a single page', () => {
      const links = hateoas.collectionLinks('/invoices', 1, 20, 0);

      expect(links.prev).toBeUndefined();
      expect(links.next).toBeUndefined();
    });
  });
});
