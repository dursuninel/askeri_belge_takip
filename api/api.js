const express = require("express");
require("dotenv").config();
const mysql = require("mysql");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY;

const path = require("path");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const { Storage } = require("@google-cloud/storage");
const projectId = process.env.PROJECT_ID;
const keyFilename = process.env.KEYFILENAME;
const bucketName = process.env.BUCKET_NAME;

const storage = new Storage({ projectId, keyFilename });
// Magic bytes (dosya türleri için baştaki baytlar)
const magicBytes = {
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // PDF
  "application/msword": [0xd0, 0xcf, 0x11, 0xe0], // Word (DOC)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    0x50, 0x4b, 0x03, 0x04,
  ], // Word (DOCX - ZIP format)
};

// Dosya türünü kontrol et
function detectFileType(fileBuffer) {
  for (let mimeType in magicBytes) {
    const magic = magicBytes[mimeType];
    let match = true;

    for (let i = 0; i < magic.length; i++) {
      if (fileBuffer[i] !== magic[i]) {
        match = false;
        break;
      }
    }

    if (match) {
      return mimeType;
    }
  }
  return "Unknown"; // Tanınmayan dosya türü
}

async function uploadFile(newFile, currentFile = "") {
  try {
    if (newFile === currentFile) {
      return currentFile;
    }

    // Base64'ten buffer'a dönüştür
    const base64Content = newFile.replace(/^data:.*;base64,/, ""); // Başlığı temizle
    const fileBuffer = Buffer.from(base64Content, "base64");

    // Dosya türünü belirle
    const fileType = detectFileType(fileBuffer);

    // Eğer dosya türü geçerli değilse hata fırlat
    if (fileType === "Unknown") {
      throw new Error("Desteklenmeyen dosya türü.");
    }

    const bucket = storage.bucket(bucketName);

    // Dosyanın uzantısını MIME türünden al
    const extension = getExtensionFromMimeType(fileType);
    if (!extension) {
      throw new Error("Desteklenmeyen dosya türü.");
    }

    const fileName = `${Date.now()}.${extension}`;

    // Dosyayı Google Cloud Storage'a kaydet
    const file = bucket.file(fileName);
    await file.save(fileBuffer);

    // Dosyanın MIME türünü ayarlamak için metadata ekleyelim
    await file.setMetadata({
      contentType: fileType,
    });

    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);
    throw error;
  }
}

// MIME türünden uzantıyı al
function getExtensionFromMimeType(mimeType) {
  const mimeToExtensionMap = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
  };
  return mimeToExtensionMap[mimeType] || null;
}
async function deleteFile(fileUrl) {
  try {
    if (fileUrl.includes(bucketName)) {
      // Dosya adını URL'den çıkar
      const fileName = fileUrl.split(`${bucketName}/`)[1];

      // Dosyayı sil
      await storage.bucket(bucketName).file(fileName).delete();
    } else {
      console.log("Invalid file URL or bucket name not found in URL.");
    }
  } catch (error) {
    // Dosya bulunamazsa Google Cloud Storage '404' hatası döndürebilir
    if (error.code === 404) {
      console.warn(`File not found: ${fileUrl}`);
    } else {
      // Diğer hatalar için uygun bir yanıt veya log verebilirsin
      console.error("Error deleting file:", error);
    }
  }
}

async function convertBuffer(file) {
  try {
    if (file !== "") {
      // Base64 formatındaki dosyanın başındaki kısmı temizleyelim
      const base64Data = file.replace(/^data:(image|video)\/\w+;base64,/, "");

      // Base64 string'i Buffer'a dönüştürelim
      const fileBuffer = Buffer.from(base64Data, "base64");

      return fileBuffer;
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error:", error);
    return { err: error };
  }
}

const options = {
  host: "localhost",
  user: "root",
  password: "",
  database: "askeryazici",
};

const connection = mysql.createConnection(options);

const app = express();

app.use(express.json({ limit: "64mb" }));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "connect.sid",
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      _expires: 600000 * 6 * 24,
    },
  })
);

app.use((req, res, next) => {
  console.log(req.method + " - " + req.url);
  next();
});

const PORT = process.env.PORT;

// Kullanıcı oturum kontrolü
const checkAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.clearCookie("connect.sid", { path: "/" });
    res.clearCookie("token", { path: "/" });
    return res.status(401).json({ error: "Token missing." });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    next();
  } catch (err) {
    res.clearCookie("connect.sid", { path: "/" });
    res.clearCookie("token", { path: "/" });
    return res.status(401).json({ error: "Token is invalid or expired." });
  }
};

app.use("/api", checkAuth);

// Log kayıt fonksiyonu
const createLog = async (req, action_type, table_name, record_id, old_data = null, new_data = null) => {
  try {
    const query = `
      INSERT INTO logs (
        user_id,
        action_type,
        table_name,
        record_id,
        old_data,
        new_data,
        ip_address,
        user_agent,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      "1",
      action_type,
      table_name,
      record_id,
      old_data ? JSON.stringify(old_data) : null,
      new_data ? JSON.stringify(new_data) : null,
      req.ip,
      req.headers['user-agent'],
    ];

    return new Promise((resolve, reject) => {
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error("Log kayıt hatası:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error("Log oluşturma hatası:", error);
  }
};

connection.connect((err) => {
  if (err) throw err;

  app.post("/login", (req, res) => {
    const { email, password } = req.body;

    connection.query(
      `SELECT * FROM auth where email = ?`,
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Database error." });
        }

        if (results.length === 0) {
          return res.status(404).json({ error: "User not found." });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.status(401).json({ error: "Invalid credentials." });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
          },
          secret,
          { expiresIn: "1h" }
        );

        // Login log kaydı
        await createLog(
          { user: { id: user.id }, ip: req.ip, headers: req.headers },
          'LOGIN',
          'auth',
          user.id,
          null,
          { email: user.email }
        );

        res.cookie("token", token, { maxAge: 3600000 });
        res.json({ user: user, token: token });
      }
    );
  });

  // Kullanıcı bilgilerini getirme
  app.get("/user", checkAuth, (req, res) => {
    try {
      const { id } = req.user;

      if (!id) {
        return res.status(400).json({ loggedIn: false, err: "Auth Error" });
      }

      const query = "SELECT id, email FROM auth WHERE id = ?";

      connection.query(query, [id], (err, results) => {
        if (err) {
          console.error("Error fetching user data:", err);
          return res.status(500).json({ error: "Error fetching user data." });
        }

        if (results.length === 0) {
          return res
            .status(404)
            .json({ error: "No user found with the provided id." });
        }

        const user = results[0];
        res.json({ loggedIn: true, user });
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Server error." });
    }
  });

  // Tüm belgeleri getirme endpoint'i
  app.get("/documents", (req, res) => {
    try {
      const query = `
        SELECT * FROM documents 
        WHERE is_deleted = 0 
        ORDER BY created_at DESC
      `;

      connection.query(query, (err, results) => {
        if (err) {
          console.error("Belge getirme hatası:", err);
          return res.status(500).json({ error: "Belgeler getirilirken bir hata oluştu." });
        }

        res.json(results);
      });
    } catch (error) {
      console.error("Server hatası:", error);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  });

  // Belge ekleme endpoint'i
  app.post("/documents/add", async (req, res) => {
    try {
      const documentData = {
        document_no: req.body.document_no,
        document_type: req.body.document_type,
        personnel_name: req.body.personnel_name,
        personnel_rank: req.body.personnel_rank,
        personnel_id: req.body.personnel_id,
        document_date: req.body.document_date,
        status: req.body.status,
        processed_by: req.body.processed_by,
        description: req.body.description,
      };

      const query = `
        INSERT INTO documents (
          document_no, document_type, personnel_name, personnel_rank,
          personnel_id, document_date, status, processed_by, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const values = Object.values(documentData);

      connection.query(query, values, async (err, result) => {
        if (err) {
          console.error("Belge ekleme hatası:", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Bu belge numarası zaten kullanımda." });
          }
          return res.status(500).json({ error: "Belge eklenirken bir hata oluştu." });
        }

        // Belge ekleme log kaydı
        await createLog(
          req,
          'CREATE',
          'documents',
          result.insertId,
          null,
          documentData
        );

        res.status(201).json({
          message: "Belge başarıyla eklendi",
          documentId: result.insertId,
        });
      });
    } catch (error) {
      console.error("Server hatası:", error);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  });

  // Belge güncelleme endpoint'i
  app.post("/documents/update/:id", async (req, res) => {
    try {
      const documentId = req.params.id;
      const newData = {
        document_no: req.body.document_no,
        document_type: req.body.document_type,
        personnel_name: req.body.personnel_name,
        personnel_rank: req.body.personnel_rank,
        personnel_id: req.body.personnel_id,
        document_date: req.body.document_date,
        status: req.body.status,
        processed_by: req.body.processed_by,
        description: req.body.description,
      };

      // Eski veriyi al
      connection.query(
        "SELECT * FROM documents WHERE id = ? AND is_deleted = 0",
        [documentId],
        async (err, results) => {
          if (err) {
            return res.status(500).json({ error: "Belge bilgileri alınamadı." });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: "Belge bulunamadı." });
          }

          const oldData = results[0];

          const query = `
            UPDATE documents 
            SET 
              document_no = ?,
              document_type = ?,
              personnel_name = ?,
              personnel_rank = ?,
              personnel_id = ?,
              document_date = ?,
              status = ?,
              processed_by = ?,
              description = ?,
              updated_at = NOW()
            WHERE id = ? AND is_deleted = 0
          `;

          const values = [...Object.values(newData), documentId];

          connection.query(query, values, async (updateErr, result) => {
            if (updateErr) {
              console.error("Belge güncelleme hatası:", updateErr);
              if (updateErr.code === "ER_DUP_ENTRY") {
                return res.status(400).json({ error: "Bu belge numarası zaten kullanımda." });
              }
              return res.status(500).json({ error: "Belge güncellenirken bir hata oluştu." });
            }

            // Güncelleme log kaydı
            await createLog(
              req,
              'UPDATE',
              'documents',
              documentId,
              oldData,
              newData
            );

            res.json({
              message: "Belge başarıyla güncellendi",
              documentId: documentId,
            });
          });
        }
      );
    } catch (error) {
      console.error("Server hatası:", error);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  });

  // Belge silme endpoint'i
  app.post("/documents/delete/:id", async (req, res) => {
    try {
      const documentId = req.params.id;

      // Önce belgenin var olup olmadığını kontrol et
      connection.query(
        "SELECT * FROM documents WHERE id = ? AND is_deleted = 0",
        [documentId],
        async (err, results) => {
          if (err) {
            console.error("Belge kontrol hatası:", err);
            return res.status(500).json({ error: "Belge kontrol edilirken bir hata oluştu." });
          }

          if (results.length === 0) {
            return res.status(404).json({ error: "Belge bulunamadı." });
          }

          const oldData = results[0];

          // Belgeyi sil (soft delete)
          const query = `
            UPDATE documents 
            SET 
              is_deleted = 1,
              deleted_at = NOW()
            WHERE id = ?
          `;

          connection.query(query, [documentId], async (err, result) => {
            if (err) {
              console.error("Belge silme hatası:", err);
              return res.status(500).json({ error: "Belge silinirken bir hata oluştu." });
            }

            // Silme log kaydı
            await createLog(
              req,
              'DELETE',
              'documents',
              documentId,
              oldData,
              null
            );

            res.json({
              message: "Belge başarıyla silindi",
              documentId: documentId,
            });
          });
        }
      );
    } catch (error) {
      console.error("Server hatası:", error);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  });

  // Log listeleme endpoint'i
  app.get("/logs", async (req, res) => {
    try {
      const query = `
        SELECT 
          l.*,
          a.email as user_email
        FROM logs l
        LEFT JOIN auth a ON l.user_id = a.id
        ORDER BY l.created_at DESC
      `;

      connection.query(query, (err, results) => {
        if (err) {
          console.error("Log getirme hatası:", err);
          return res.status(500).json({ error: "Loglar getirilirken bir hata oluştu." });
        }

        res.json(results);
      });
    } catch (error) {
      console.error("Server hatası:", error);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  });

  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
  });
});
