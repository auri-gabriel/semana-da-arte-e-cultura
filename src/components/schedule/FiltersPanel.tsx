import { useState } from 'preact/hooks';

type FiltersPanelProps = {
  search: string;
  turno: string;
  proponente: string;
  local: string;
  turnos: string[];
  proponentes: string[];
  locais: string[];
  onSearchChange: (value: string) => void;
  onTurnoChange: (value: string) => void;
  onProponenteChange: (value: string) => void;
  onLocalChange: (value: string) => void;
};

export function FiltersPanel({
  search,
  turno,
  proponente,
  local,
  turnos,
  proponentes,
  locais,
  onSearchChange,
  onTurnoChange,
  onProponenteChange,
  onLocalChange,
}: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section class='accordion mb-3'>
      <div class='accordion-item board-panel p-0 overflow-hidden'>
        <h2 class='accordion-header'>
          <button
            type='button'
            class={`accordion-button ${isOpen ? '' : 'collapsed'}`}
            onClick={() => setIsOpen((previous) => !previous)}
            aria-expanded={isOpen}
            aria-controls='filters-panel-body'
          >
            Filtros
          </button>
        </h2>

        <div
          id='filters-panel-body'
          class={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
        >
          <div class='accordion-body'>
            <div class='row g-2'>
              <div class='col-12'>
                <label class='form-label'>Busca</label>
                <input
                  class='form-control'
                  placeholder='Título, local ou proponente'
                  value={search}
                  onInput={(event) =>
                    onSearchChange((event.target as HTMLInputElement).value)
                  }
                />
              </div>

              <div class='col-12 col-md-4 col-xl-12'>
                <label class='form-label'>Turno</label>
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
                <label class='form-label'>Proponente</label>
                <select
                  class='form-select'
                  value={proponente}
                  onChange={(event) =>
                    onProponenteChange(
                      (event.target as HTMLSelectElement).value,
                    )
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
                <label class='form-label'>Local</label>
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
          </div>
        </div>
      </div>
    </section>
  );
}
