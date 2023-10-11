interface RateLimitFollowerOptions {
  PerTime: number;
  maxLimit: number;
}

export class RateLimitFollower {
  private maxLimit: number;
  private PerTime: number;

  private Requests: number = 0;
  private lastCheck = Date.now();

  constructor({ maxLimit, PerTime }: RateLimitFollowerOptions) {
    this.maxLimit = maxLimit;
    this.PerTime = PerTime;
  }

  private checktime = () => {
    if (Date.now() - this.lastCheck > this.PerTime) {
      //if need to restart counting
      this.lastCheck = Date.now();
      this.Requests = 0;
    }
  };

  //returns true if on good rate false if need to ease if the requests
  GoodRate = () => {
    this.checktime();
    const currentRate = this.Requests / (Date.now() - this.lastCheck);
    const expectedRate = this.maxLimit / this.PerTime;
    return currentRate <= expectedRate;
  };

  checkforAllow = (number?: number) => {
    this.checktime();
    if (!number) number = 1;
    const isOverLimit = this.Requests + number >= this.maxLimit;
    if (isOverLimit) {
      return this.PerTime - (Date.now() - this.lastCheck);
    }
    if (this.GoodRate()) {
      return 0;
    } else {
      return -1;
    }
  };

  addToFollow = (number: number) => {
    this.checktime();
    if (this.Requests + number > this.maxLimit) {
      return false;
    } else {
      this.Requests += number;
      return true;
    }
  };

  getRequests = () => this.Requests;
  getMaxLimit = () => this.maxLimit;
  getPerTime = () => this.PerTime;
  getLastCheck = () => this.lastCheck;
}
