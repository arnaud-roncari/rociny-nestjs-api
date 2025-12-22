export class PortfolioUpdatedDto {
  constructor(portfolio: string[]) {
    this.portfolio = portfolio;
  }

  readonly portfolio: string[];
}
