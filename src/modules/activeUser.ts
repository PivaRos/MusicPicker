import { User } from "./User";

export class activeUsers {
  private Users: User[] = [];

  getUsers = () => {
    return this.Users;
  };

  getAmountOfUsers = () => this.Users.length;

  addUser = (User: User) => {
    let found = false;
    for (let i = 0; i < this.Users.length; i++) {
      if (this.Users[i].getId() === User.getId()) {
        found = true;
      }
    }
    if (!found) this.Users.push(User);
    return !found;
  };

  removeUser = (User: User) => {
    for (let i = 0; i < this.Users.length; i++) {
      if (this.Users[i].getId() === User.getId()) {
        this.Users.splice(i, 1);
        return true;
      }
    }
    return false;
  };

  exist = (userid: string) => {
    for (let c = 0; c < this.Users.length; c++) {
      if (this.Users[c].getId() === userid) return true;
    }
    return false;
  };
}
