import * as bcrypt from 'bcrypt';

export const cryptPassword = async (password: string): Promise<string> => {
  try {
    const genSalt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, genSalt);
    return hash;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const comparePassword = async (
  password: string | Buffer,
  passwordEncrypted: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, passwordEncrypted);
  } catch (error) {
    throw new Error(error as string);
  }
};
