type AppFooterProps = {
  footerLogoSrc: string;
};

export function AppFooter({ footerLogoSrc }: AppFooterProps) {
  return (
    <footer class='border-top bg-white app-footer'>
      <div class='container-fluid board-layout py-3 d-flex flex-wrap align-items-center justify-content-between gap-2'>
        <span class='small text-body-secondary'>
          II Semana de Arte e Cultura de Alegrete · UNIPAMPA
        </span>
        <img
          src={footerLogoSrc}
          alt='UNIPAMPA'
          class='brand-logo brand-logo-footer'
          loading='lazy'
        />
      </div>
    </footer>
  );
}
