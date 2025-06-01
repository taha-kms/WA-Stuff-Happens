import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

export function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = await getUserByEmail(email);
    if (!user) return done(null, false, { message: 'No user with that email' });

    try {
      if (await bcrypt.compare(password, user.password_hash)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await getUserById(id);
    return done(null, user);
  });
}
