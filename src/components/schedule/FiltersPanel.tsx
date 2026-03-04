type FiltersPanelProps = {
  search: string;
  turno: string;
  modalidade: string;
  proponente: string;
  local: string;
  turnos: string[];
  modalidades: string[];
  proponentes: string[];
  locais: string[];
  onSearchChange: (value: string) => void;
  onTurnoChange: (value: string) => void;
  onModalidadeChange: (value: string) => void;
  onProponenteChange: (value: string) => void;
  onLocalChange: (value: string) => void;
};

export function FiltersPanel({
  search,
  turno,
  modalidade,
  proponente,
  local,
  turnos,
  modalidades,
  proponentes,
  locais,
  onSearchChange,
  onTurnoChange,
  onModalidadeChange,
  onProponenteChange,
  onLocalChange,
}: FiltersPanelProps) {
  return (
    <section class='board-panel p-3 mb-3'>
      <h2 class='h6 mb-3 d-flex align-items-center'>
        <i class='bi bi-funnel me-2' aria-hidden='true' />
        Filtros
      </h2>

      <div class='row g-2'>
        <div class='col-12'>
          <label class='form-label'>
            <i class='bi bi-search me-1' aria-hidden='true' />
            Busca
          </label>
          <input
            class='form-control'
            placeholder='Título, modalidade, local ou proponente'
            value={search}
            onInput={(event) =>
              onSearchChange((event.target as HTMLInputElement).value)
            }
          />
        </div>

        <div class='col-12 col-md-4 col-xl-12'>
          <label class='form-label'>
            <i class='bi bi-clock me-1' aria-hidden='true' />
            Turno
          </label>
          <select
            class='form-select'
            value={turno}
            onChange={(event) =>
              onTurnoChange((event.target as HTMLSelectElement).value)
            }
          >
            <option value=''>Todos</option>
            {turnos.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div class='col-12 col-md-8 col-xl-12'>
          <label class='form-label'>
            <i class='bi bi-tags me-1' aria-hidden='true' />
            Modalidade
          </label>
          <select
            class='form-select'
            value={modalidade}
            onChange={(event) =>
              onModalidadeChange((event.target as HTMLSelectElement).value)
            }
          >
            <option value=''>Todas</option>
            {modalidades.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div class='col-12 col-md-8 col-xl-12'>
          <label class='form-label'>
            <i class='bi bi-person-badge me-1' aria-hidden='true' />
            Proponente
          </label>
          <select
            class='form-select'
            value={proponente}
            onChange={(event) =>
              onProponenteChange((event.target as HTMLSelectElement).value)
            }
          >
            <option value=''>Todos</option>
            {proponentes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div class='col-12'>
          <label class='form-label'>
            <i class='bi bi-geo-alt me-1' aria-hidden='true' />
            Local
          </label>
          <select
            class='form-select'
            value={local}
            onChange={(event) =>
              onLocalChange((event.target as HTMLSelectElement).value)
            }
          >
            <option value=''>Todos</option>
            {locais.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
