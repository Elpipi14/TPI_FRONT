export function renderPagination(
  totalPages: number,
  currentPage: number,
  onPrevious: () => void,
  onNext: () => void
): void {
  const pagination = document.querySelector<HTMLElement>("#orders-pagination");

  if (!pagination) {
    return;
  }

  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = `
    <button type="button" id="prev-orders-page" ${currentPage === 1 ? "disabled" : ""}>
      Anterior
    </button>

    <span>Página ${currentPage} de ${totalPages}</span>

    <button type="button" id="next-orders-page" ${currentPage === totalPages ? "disabled" : ""}>
      Siguiente
    </button>
  `;

  pagination.querySelector<HTMLButtonElement>("#prev-orders-page")?.addEventListener("click", onPrevious);
  pagination.querySelector<HTMLButtonElement>("#next-orders-page")?.addEventListener("click", onNext);
}