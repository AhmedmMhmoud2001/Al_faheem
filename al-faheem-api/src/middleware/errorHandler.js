export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Prisma: connection / server unreachable
  if (err.name === 'PrismaClientInitializationError') {
    return res.status(503).json({
      message:
        'تعذر الاتصال بقاعدة البيانات. تأكد أن MySQL يعمل في XAMPP وأن DATABASE_URL في .env صحيح.',
      code: err.errorCode || 'DB_INIT',
    });
  }

  // Prisma query engine errors (P1001 = can't reach DB, P1017 = server closed connection, P1003 = DB missing)
  if (typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2021') {
      return res.status(503).json({
        message:
          'جدول غير موجود في قاعدة البيانات (غالباً بعد تحديث المشروع). من مجلد al-faheem-api نفّذ npm run db:push ثم npm run db:generate ثم أعد تشغيل الخادم.',
        code: err.code,
      });
    }
    if (err.code === 'P1001' || err.code === 'P1017') {
      return res.status(503).json({
        message: 'خادم MySQL غير متاح على العنوان المحدد في DATABASE_URL.',
        code: err.code,
      });
    }
    if (err.code === 'P1003') {
      return res.status(503).json({
        message:
          'قاعدة البيانات غير موجودة على الخادم. أنشئ قاعدة al_faheem في phpMyAdmin ثم نفّذ npm run db:push و npm run db:seed.',
        code: err.code,
      });
    }
    if (process.env.NODE_ENV === 'development') {
      console.error('[Prisma]', err.code, err.message);
    }
    return res.status(400).json({
      message: err.message || 'Database request failed',
      code: err.code,
    });
  }

  const status = err.status || err.statusCode || 500;
  const body = {
    message: err.message || 'Internal Server Error',
    code: err.code,
  };
  if (err.details) body.details = err.details;
  if (process.env.NODE_ENV === 'development') {
    if (err.stack) body.stack = err.stack;
    if (status >= 500) console.error(err);
  }
  res.status(status).json(body);
}

export class HttpError extends Error {
  constructor(status, message, details, code) {
    super(message);
    this.status = status;
    this.details = details;
    this.code = code;
  }
}
