const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

let db;

// Function to open the SQLite database
async function openDatabase() {
    return new Promise((resolve, reject) => {
        const dbPath = path.resolve(__dirname, '../../userCreds.db');
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Function to close the SQLite database
async function closeDatabase() {
  return new Promise((resolve, reject) => {
      if (db && db.open) {
          db.close((err) => {
              if (err) {
                  reject(err);
              } else {
                  resolve();
              }
          });
      } else {
          resolve(); // Resolve if database is already closed
      }
  });
}

// Function to create the users table if it doesn't exist
async function createUsersTable() {
    await openDatabase();
    return new Promise((resolve, reject) => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            userType TEXT NOT NULL
        )`, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    }).finally(closeDatabase);
}

// Function to insert user credentials into the database
async function insertUser(username, password, type) {
    await openDatabase();
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password, userType) VALUES (?, ?, ?)', [username, password, type], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, username, password });
            }
        });
    }).finally(closeDatabase);
}

// Function to load user data from the database
async function loadUserData(userId) {
    let adminDefaultPassword = 'admin'
    await openDatabase();
    try {
        const userData = await getUserById(userId);

        if (userData) {
            return {
                username: userData.username,
                password: userData.password
            };
        } else if (username === process.env.manufacturerDefaultUsername) {
            return {
                username: process.env.manufacturerDefaultUsername,
                password: manufacturerDefaultPassword // Use manufacturer password
            };
        } else {
            return {
                username: 'admin',
                password: adminDefaultPassword // Use defaultPassword
            };
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        return {
            username: null,
            password: null
        };
    }
}

// Function to validate user credentials
async function validateUserData(username, password) {
  await openDatabase();
  try {
      const userData = await getUserByName(username);

      if (userData) {
          const result = await bcrypt.compare(password, userData.password);
          if (result) {
              return 0; // Successful login for admin
          } else {
              return -2; // Invalid password for admin
          }
      } else {
          return -1; // User not found
      }
  } catch (error) {
      console.error('Error validating user data:', error);
      return { type: 'unknown', code: -1 }; // Generic error
  } finally {
      await closeDatabase();
  }
}
// Function to retrieve user credentials from the database
async function getUserByName(username) {
    await openDatabase();
    return new Promise((resolve, reject) => {
        db.get('SELECT id, username, password, userType FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                resolve(row);
            } else {
                console.log("user not found");
                resolve(null); // Return null if no user is found
            }
        });
    })
}

// Function to retrieve user credentials from the database
async function getUserById(id) {
    console.log("id in getUser", id);
    await openDatabase();
    return new Promise((resolve, reject) => {
        db.get('SELECT id, username, password, userType FROM users WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.log("get user failed");
                reject(err);
            } else if (row) {
                console.log("get user success");
                resolve(row);
            } else {
                console.log("user not found");
                resolve(null); // Return null if no user is found
            }
        });
    }).finally(() => {
        closeDatabase();
    });
}


async function updateUserData(userData) {
    // Hash the password
    const hashedPassword = await hashPassword(userData.admin.password);
    userData.admin.password = hashedPassword;
    console.log("hashedPassword", hashedPassword);
    
    await openDatabase();
    console.log("Database opened");
    console.log("userData.admin.password", userData.admin.password)
    console.log("userData.username", userData.admin.username)

    return new Promise((resolve, reject) => {
        console.log("Running the update query");
        // Update the user data in the database
        db.run(
            'UPDATE users SET username = ?, password = ? WHERE id = ?',
            [userData.admin.username, userData.admin.password, userData.admin.id],
            (err) => {
                if (err) {
                    console.error("Error updating user data:", err);
                    reject(err);
                } else {
                    console.log("User data updated successfully");
                    resolve({ message: 'User data updated successfully' });
                }
            }
        );
    }).finally(() => {
        closeDatabase();
        console.log("Database closed");
    });
}


// Function to hash a password
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Function to create the default users in the database
async function createDefaultUserData() {
  await openDatabase();
  try {
      await createUsersTable();
      
      const adminExists = await getUserById(1); //check if user already created
      const manufacturerExists = await getUserByName(process.env.manufacturerDefaultUsername);

      if (!adminExists) {
          // Hash passwords before inserting into the database
          const hashedAdminPassword = await hashPassword('admin');
          await insertUser('admin', hashedAdminPassword, 'admin');
          console.log('Default user data created successfully.');
      }

      if (!manufacturerExists) {
          // Hash manufacturer password before inserting into the database
          const hashedManufacturerPassword = await hashPassword(process.env.manufacturerDefaultPassword);
          await insertUser(process.env.manufacturerDefaultUsername, hashedManufacturerPassword, 'manufacturer');
          console.log('Default manufacturer data created successfully.');
      }
      
  } catch (error) {
      console.error('Error creating default user data:', error);
  }
}


// Export all functions
module.exports = {
    loadUserData,
    createUsersTable,
    insertUser,
    getUserByName,
    getUserById,
    updateUserData,
    hashPassword,
    validateUserData,
    createDefaultUserData
};
