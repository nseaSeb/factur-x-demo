import { NavLink, Route, Routes } from 'react-router-dom';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ParseUploadPage from './pages/ParseUploadPage';
import ProductListPage from './pages/ProductListPage';
import ProductFormPage from './pages/ProductFormPage';

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <h1>Factur-X — démo</h1>
        <nav>
          <NavLink to="/" end>
            Factures
          </NavLink>
          <NavLink to="/invoices/new">Créer</NavLink>
          <NavLink to="/invoices/parse">Importer un PDF</NavLink>
          <NavLink to="/products">Catalogue</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<InvoiceListPage />} />
          <Route path="/invoices/new" element={<CreateInvoicePage />} />
          <Route path="/invoices/parse" element={<ParseUploadPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
