export class CreateNotaFromOficioDto {
  oficioId: string;
}

export class AnalisarNotaDto {
  acao: 'APROVAR' | 'RECUSAR';
  motivoRecusa?: string;
}
