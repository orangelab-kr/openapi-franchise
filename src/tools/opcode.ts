enum OPCODE {
  SUCCESS = 0,
  ERROR = 1,
  ACCESS_DENIED = 3,
  NOT_FOUND = 4,
  EXCESS_LIMITS = 5,
  ALREADY_EXISTS = 9,
  INVALID_ACCESS_KEY = 25,
  REQUIRED_LOGIN = 29,
  REQUIRED_INTERNAL_LOGIN = 30,
}

export default OPCODE;
