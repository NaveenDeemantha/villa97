const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const db = require('./database');

// Local Strategy for username/password authentication
passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      // Remove password from user object
      delete user.password;

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// JWT Strategy for token-based authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    // Find user by ID from JWT payload
    const result = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
      [jwtPayload.id]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    const user = result.rows[0];
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

module.exports = passport;
