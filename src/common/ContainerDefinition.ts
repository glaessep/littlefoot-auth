export class ContainerDefinition {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(readonly id: string, readonly partitionKey: string | any[], readonly url: string) {}
}
