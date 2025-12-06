// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inventaris_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username dan password harus diisi' 
    });
  }
  
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Username atau password salah' 
      });
    }
    
    const user = results[0];
    const token = 'token_' + user.id + '_' + Date.now();
    
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token: token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name
        }
      }
    });
  });
});

app.post('/api/register', (req, res) => {
  const { username, password, name } = req.body;
  
  if (!username || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Semua field harus diisi' 
    });
  }
  
  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + err.message 
      });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username sudah terdaftar' 
      });
    }
    
    const insertQuery = 'INSERT INTO users (username, password, name) VALUES (?, ?, ?)';
    db.query(insertQuery, [username, password, name], (err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error: ' + err.message 
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: result.insertId,
          username: username,
          name: name
        }
      });
    });
  });
});

app.get('/api/inventories', (req, res) => {
  const query = 'SELECT * FROM inventories ORDER BY id DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + err.message 
      });
    }
    
    res.json({
      success: true,
      data: results
    });
  });
});

app.get('/api/inventories/:id', (req, res) => {
  const query = 'SELECT * FROM inventories WHERE id = ?';
  
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inventaris tidak ditemukan' 
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
});

app.post('/api/inventories', (req, res) => {
  const { nama, harga, jumlah, tanggalMasuk } = req.body;
  
  if (!nama || !harga || !jumlah || !tanggalMasuk) {
    return res.status(400).json({ 
      success: false, 
      message: 'Semua field harus diisi' 
    });
  }
  
  const query = 'INSERT INTO inventories (nama, harga, jumlah, tanggalMasuk) VALUES (?, ?, ?, ?)';
  
  db.query(query, [nama, parseInt(harga), parseInt(jumlah), tanggalMasuk], (err, result) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + err.message 
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Inventaris berhasil ditambahkan',
      data: {
        id: result.insertId,
        nama: nama,
        harga: parseInt(harga),
        jumlah: parseInt(jumlah),
        tanggalMasuk: tanggalMasuk
      }
    });
  });
});

app.put('/api/inventories/:id', (req, res) => {
  const { nama, harga, jumlah, tanggalMasuk } = req.body;
  const id = req.params.id;
  
  if (!nama || !harga || !jumlah || !tanggalMasuk) {
    return res.status(400).json({ 
      success: false, 
      message: 'Semua field harus diisi' 
    });
  }
  
  const checkQuery = 'SELECT * FROM inventories WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inventaris tidak ditemukan' 
      });
    }
    
    const updateQuery = 'UPDATE inventories SET nama = ?, harga = ?, jumlah = ?, tanggalMasuk = ? WHERE id = ?';
    db.query(updateQuery, [nama, parseInt(harga), parseInt(jumlah), tanggalMasuk, id], (err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error: ' + err.message 
        });
      }
      
      res.json({
        success: true,
        message: 'Inventaris berhasil diupdate',
        data: {
          id: parseInt(id),
          nama: nama,
          harga: parseInt(harga),
          jumlah: parseInt(jumlah),
          tanggalMasuk: tanggalMasuk
        }
      });
    });
  });
});

app.delete('/api/inventories/:id', (req, res) => {
  const id = req.params.id;
  
  const checkQuery = 'SELECT * FROM inventories WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database error: ' + err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Inventaris tidak ditemukan' 
      });
    }
    
    const deletedItem = results[0];
    
    const deleteQuery = 'DELETE FROM inventories WHERE id = ?';
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error: ' + err.message 
        });
      }
      
      res.json({
        success: true,
        message: 'Inventaris berhasil dihapus',
        data: deletedItem
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server berjalan di port', PORT);
  console.log('API URL: http://localhost:' + PORT);
});