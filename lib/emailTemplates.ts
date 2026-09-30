export function newTicketTemplate(ticket: {
  id: number;
  empresa: string;
  solicitante: string;
  telefone: string;
  email: string;
  produto: string;
  descricao: string;
  prioridade: boolean;
  data: Date | string;
  url: string;
}) {
  return `
<div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #ddd;border-radius:8px;padding:24px">
  <table style="width:100%;margin-bottom:20px;border-collapse:collapse">
    <tr>
      <td>
        <h2 style="margin:0;color:#3f7a49">
          Novo chamado #${ticket.id}
        </h2>
      </td>

      <td align="right">
        <a
          href="${ticket.url}"
          style="
            background:#3f7a49;
            color:#fff;
            text-decoration:none;
            padding:10px 18px;
            border-radius:6px;
            font-weight:bold;
            font-size:14px;
            display:inline-block;
            white-space:nowrap;
          "
        >
          Visualizar chamado
        </a>
      </td>
    </tr>
  </table>

  ${
    ticket.prioridade
      ? `
      <div style="
        display:inline-block;
        background:#dc2626;
        color:white;
        padding:6px 12px;
        border-radius:999px;
        font-weight:bold;
        margin-bottom:20px;
      ">
        ⚠ Hot-line
      </div>
      `
      : ""
  }

  <table style="width:100%;border-collapse:collapse">
    <tr>
      <td><strong>Data/Hora da abertura</strong></td>
      <td>${formatDateTime(ticket.data)}</td>
    </tr>

    <tr>
      <td><strong>Empresa</strong></td>
      <td>${ticket.empresa}</td>
    </tr>

    <tr>
      <td><strong>Solicitante</strong></td>
      <td>${ticket.solicitante}</td>
    </tr>

    <tr>
      <td><strong>Produto</strong></td>
      <td>${ticket.produto}</td>
    </tr>
  </table>

  <hr style="margin:20px 0">

  <h3>Solicitação</h3>
  <div style="
    background:#f8f8f8;
    border-left:4px solid #3f7a49;
    padding:12px;
    border-radius:4px;

    white-space:pre-wrap;

    word-wrap:break-word;
    overflow-wrap:anywhere;
    word-break:break-all;

    max-width:100%;
    box-sizing:border-box;
  ">
    ${ticket.descricao}
  </div>

  <hr style="margin:20px 0">

  <h3>Dados para contato</h3>
  <table style="width:100%">
    <tr>
      <td><strong>Telefone</strong></td>
      <td>${ticket.telefone}</td>
    </tr>

    <tr>
      <td><strong>E-mail</strong></td>
      <td>${ticket.email}</td>
    </tr>
  </table>
</div>
`;
}

function formatDateTime(dateValue?: string | Date | null) {
  if (!dateValue) return '-';

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (isNaN(date.getTime())) {
    return '-';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}