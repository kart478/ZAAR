"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var bcryptjs_1 = require("bcryptjs");
var nodemailer_1 = require("nodemailer");
var jsonwebtoken_1 = require("jsonwebtoken");
var express_rate_limit_1 = require("express-rate-limit");
// Database abstraction layer (replace with your actual DB)
var DatabaseService = /** @class */ (function () {
    function DatabaseService() {
    }
    return DatabaseService;
}());
// Mock implementation (replace with your actual database)
var MockDatabaseService = /** @class */ (function (_super) {
    __extends(MockDatabaseService, _super);
    function MockDatabaseService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.users = [
            {
                id: 'user1',
                email: 'user@example.com',
                password: '$2a$10$example.hashed.password'
            }
        ];
        _this.resetCodes = new Map();
        _this.resetTokens = new Map();
        return _this;
    }
    MockDatabaseService.prototype.findUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.find(function (user) { return user.email === email; })];
            });
        });
    };
    MockDatabaseService.prototype.findUserById = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.find(function (user) { return user.id === userId; })];
            });
        });
    };
    MockDatabaseService.prototype.updateUserPassword = function (userId, hashedPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var userIndex;
            return __generator(this, function (_a) {
                userIndex = this.users.findIndex(function (user) { return user.id === userId; });
                if (userIndex !== -1) {
                    this.users[userIndex].password = hashedPassword;
                }
                return [2 /*return*/];
            });
        });
    };
    MockDatabaseService.prototype.storeResetCode = function (resetCode) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, key, code, user;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Clean up existing codes for this email
                        for (_i = 0, _a = this.resetCodes.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], code = _b[1];
                            if (code.userId === resetCode.userId) {
                                this.resetCodes.delete(key);
                            }
                        }
                        return [4 /*yield*/, this.findUserById(resetCode.userId)];
                    case 1:
                        user = _c.sent();
                        if (user) {
                            this.resetCodes.set(user.email, resetCode);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    MockDatabaseService.prototype.findResetCode = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var code;
            return __generator(this, function (_a) {
                code = this.resetCodes.get(email);
                return [2 /*return*/, code || null];
            });
        });
    };
    MockDatabaseService.prototype.markResetCodeUsed = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var code;
            return __generator(this, function (_a) {
                code = this.resetCodes.get(email);
                if (code) {
                    code.isUsed = true;
                }
                return [2 /*return*/];
            });
        });
    };
    MockDatabaseService.prototype.storeResetToken = function (resetToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.resetTokens.set(resetToken.token, resetToken);
                return [2 /*return*/];
            });
        });
    };
    MockDatabaseService.prototype.findResetToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.resetTokens.get(token) || null];
            });
        });
    };
    MockDatabaseService.prototype.markResetTokenUsed = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var resetToken;
            return __generator(this, function (_a) {
                resetToken = this.resetTokens.get(token);
                if (resetToken) {
                    resetToken.isUsed = true;
                }
                return [2 /*return*/];
            });
        });
    };
    MockDatabaseService.prototype.cleanupExpiredCodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, _i, _a, _b, email, code, _c, _d, _e, token, resetToken;
            return __generator(this, function (_f) {
                now = new Date();
                // Clean expired reset codes
                for (_i = 0, _a = this.resetCodes.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], email = _b[0], code = _b[1];
                    if (code.expiresAt < now) {
                        this.resetCodes.delete(email);
                    }
                }
                // Clean expired reset tokens
                for (_c = 0, _d = this.resetTokens.entries(); _c < _d.length; _c++) {
                    _e = _d[_c], token = _e[0], resetToken = _e[1];
                    if (resetToken.expiresAt < now) {
                        this.resetTokens.delete(token);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    return MockDatabaseService;
}(DatabaseService));
// Email Service
var EmailService = /** @class */ (function () {
    function EmailService() {
        // Configure for your email service
        this.transporter = nodemailer_1.default.createTransporter({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    EmailService.prototype.sendPasswordResetCode = function (email, code) {
        return __awaiter(this, void 0, void 0, function () {
            var mailOptions, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        mailOptions = {
                            from: process.env.EMAIL_FROM || 'noreply@yourapp.com',
                            to: email,
                            subject: 'Reset Your Password - Verification Code',
                            html: this.getPasswordResetTemplate(code),
                        };
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 1:
                        _a.sent();
                        console.log("Password reset code sent to ".concat(email, ": ").concat(code));
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Failed to send email:', error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.getPasswordResetTemplate = function (code) {
        return "\n      <!DOCTYPE html>\n      <html>\n      <head>\n        <meta charset=\"utf-8\">\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n        <title>Password Reset Code</title>\n        <style>\n          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n          .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n          .header { text-align: center; padding: 20px 0; }\n          .code { \n            background: #f4f4f4; \n            border: 2px solid #ddd; \n            border-radius: 8px; \n            padding: 20px; \n            text-align: center; \n            font-size: 24px; \n            font-weight: bold; \n            letter-spacing: 3px;\n            margin: 20px 0;\n          }\n          .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #666; }\n          .security { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }\n        </style>\n      </head>\n      <body>\n        <div class=\"container\">\n          <div class=\"header\">\n            <h1>Password Reset Request</h1>\n          </div>\n          \n          <p>Hello,</p>\n          <p>You requested to reset your password. Use the verification code below to proceed:</p>\n          \n          <div class=\"code\">".concat(code, "</div>\n          \n          <div class=\"security\">\n            <strong>Security Notice:</strong>\n            <ul>\n              <li>This code will expire in 10 minutes</li>\n              <li>Never share this code with anyone</li>\n              <li>If you didn't request this, please ignore this email</li>\n            </ul>\n          </div>\n          \n          <p>If you have any questions, contact our support team.</p>\n          \n          <div class=\"footer\">\n            <p>This is an automated message. Please do not reply to this email.</p>\n            <p>&copy; 2024 Your Application. All rights reserved.</p>\n          </div>\n        </div>\n      </body>\n      </html>\n    ");
    };
    return EmailService;
}());
// Password Reset Service
var PasswordResetService = /** @class */ (function () {
    function PasswordResetService(db, emailService) {
        this.db = db;
        this.emailService = emailService;
    }
    PasswordResetService.prototype.requestPasswordReset = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user, code, hashedCode, resetCode, emailSent, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.db.findUserByEmail(email)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            console.log("Password reset requested for non-existent email: ".concat(email));
                            return [2 /*return*/, {
                                    success: true,
                                    message: "If an account with this email exists, a verification code has been sent."
                                }];
                        }
                        code = Math.floor(100000 + Math.random() * 900000).toString();
                        return [4 /*yield*/, bcryptjs_1.default.hash(code, 10)];
                    case 2:
                        hashedCode = _a.sent();
                        resetCode = {
                            userId: user.id,
                            hashedCode: hashedCode,
                            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                            isUsed: false,
                            createdAt: new Date(),
                        };
                        return [4 /*yield*/, this.db.storeResetCode(resetCode)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.emailService.sendPasswordResetCode(email, code)];
                    case 4:
                        emailSent = _a.sent();
                        if (!emailSent) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Failed to send verification code. Please try again."
                                }];
                        }
                        return [2 /*return*/, {
                                success: true,
                                message: "If an account with this email exists, a verification code has been sent."
                            }];
                    case 5:
                        error_2 = _a.sent();
                        console.error('Password reset request error:', error_2);
                        return [2 /*return*/, {
                                success: false,
                                message: "An error occurred while processing your request."
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PasswordResetService.prototype.verifyResetCode = function (email, code) {
        return __awaiter(this, void 0, void 0, function () {
            var resetCode, isValidCode, resetToken, tokenData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.db.findResetCode(email)];
                    case 1:
                        resetCode = _a.sent();
                        if (!resetCode) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Invalid or expired verification code."
                                }];
                        }
                        // Check if expired
                        if (resetCode.expiresAt < new Date()) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Verification code has expired. Please request a new one."
                                }];
                        }
                        // Check if already used
                        if (resetCode.isUsed) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Verification code has already been used. Please request a new one."
                                }];
                        }
                        return [4 /*yield*/, bcryptjs_1.default.compare(code, resetCode.hashedCode)];
                    case 2:
                        isValidCode = _a.sent();
                        if (!isValidCode) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Invalid verification code."
                                }];
                        }
                        // Mark code as used
                        return [4 /*yield*/, this.db.markResetCodeUsed(email)];
                    case 3:
                        // Mark code as used
                        _a.sent();
                        resetToken = jsonwebtoken_1.default.sign({ userId: resetCode.userId, type: 'password_reset' }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '15m' });
                        tokenData = {
                            userId: resetCode.userId,
                            token: resetToken,
                            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                            isUsed: false,
                            createdAt: new Date(),
                        };
                        return [4 /*yield*/, this.db.storeResetToken(tokenData)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                resetToken: resetToken,
                                message: "Code verified successfully. You can now reset your password."
                            }];
                    case 5:
                        error_3 = _a.sent();
                        console.error('Code verification error:', error_3);
                        return [2 /*return*/, {
                                success: false,
                                message: "An error occurred while verifying the code."
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PasswordResetService.prototype.resetPassword = function (resetToken, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, tokenData, hashedPassword, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        decoded = void 0;
                        try {
                            decoded = jsonwebtoken_1.default.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
                        }
                        catch (error) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Invalid or expired reset token."
                                }];
                        }
                        if (decoded.type !== 'password_reset') {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Invalid reset token."
                                }];
                        }
                        return [4 /*yield*/, this.db.findResetToken(resetToken)];
                    case 1:
                        tokenData = _a.sent();
                        if (!tokenData) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Invalid or expired reset token."
                                }];
                        }
                        if (tokenData.isUsed) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Reset token has already been used."
                                }];
                        }
                        if (tokenData.expiresAt < new Date()) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Reset token has expired."
                                }];
                        }
                        // Validate new password
                        if (newPassword.length < 8) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Password must be at least 8 characters long."
                                }];
                        }
                        return [4 /*yield*/, bcryptjs_1.default.hash(newPassword, 10)];
                    case 2:
                        hashedPassword = _a.sent();
                        // Update user password
                        return [4 /*yield*/, this.db.updateUserPassword(tokenData.userId, hashedPassword)];
                    case 3:
                        // Update user password
                        _a.sent();
                        // Mark token as used
                        return [4 /*yield*/, this.db.markResetTokenUsed(resetToken)];
                    case 4:
                        // Mark token as used
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Password has been reset successfully."
                            }];
                    case 5:
                        error_4 = _a.sent();
                        console.error('Password reset error:', error_4);
                        return [2 /*return*/, {
                                success: false,
                                message: "An error occurred while resetting your password."
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return PasswordResetService;
}());
// Express App Setup
var app = (0, express_1.default)();
app.use(express_1.default.json());
// Initialize services
var db = new MockDatabaseService(); // Replace with your actual DB service
var emailService = new EmailService();
var passwordResetService = new PasswordResetService(db, emailService);
// Rate limiting
var resetRequestLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 requests per windowMs
    message: {
        success: false,
        message: "Too many password reset requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
var verifyCodeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 verification attempts per windowMs
    message: {
        success: false,
        message: "Too many verification attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Cleanup expired codes periodically
setInterval(function () {
    db.cleanupExpiredCodes();
}, 5 * 60 * 1000); // Every 5 minutes
// API Routes
/**
 * POST /api/auth/request-password-reset
 * Request a password reset code
 */
app.post('/api/auth/request-password-reset', resetRequestLimiter, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                email = req.body.email;
                // Validate input
                if (!email || !email.includes('@')) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Valid email address is required."
                        })];
                }
                return [4 /*yield*/, passwordResetService.requestPasswordReset(email)];
            case 1:
                result = _a.sent();
                // Always return 200 for security (don't reveal if email exists)
                res.status(200).json(result);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Request password reset error:', error_5);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while processing your request."
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/auth/verify-reset-code
 * Verify the reset code and get reset token
 */
app.post('/api/auth/verify-reset-code', verifyCodeLimiter, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, code, result, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, email = _a.email, code = _a.code;
                // Validate input
                if (!email || !code) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Email and verification code are required."
                        })];
                }
                if (!/^\d{6}$/.test(code)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Verification code must be 6 digits."
                        })];
                }
                return [4 /*yield*/, passwordResetService.verifyResetCode(email, code)];
            case 1:
                result = _b.sent();
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
                return [3 /*break*/, 3];
            case 2:
                error_6 = _b.sent();
                console.error('Verify reset code error:', error_6);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while verifying the code."
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/auth/reset-password
 * Reset the password using reset token
 */
app.post('/api/auth/reset-password', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, resetToken, newPassword, result, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, resetToken = _a.resetToken, newPassword = _a.newPassword;
                // Validate input
                if (!resetToken || !newPassword) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Reset token and new password are required."
                        })];
                }
                if (newPassword.length < 8) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: "Password must be at least 8 characters long."
                        })];
                }
                return [4 /*yield*/, passwordResetService.resetPassword(resetToken, newPassword)];
            case 1:
                result = _b.sent();
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
                return [3 /*break*/, 3];
            case 2:
                error_7 = _b.sent();
                console.error('Reset password error:', error_7);
                res.status(500).json({
                    success: false,
                    message: "An error occurred while resetting your password."
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Health check endpoint
app.get('/api/health', function (req, res) {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'password-reset-api'
    });
});
// Error handling middleware
app.use(function (err, req, res, next) {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});
// 404 handler
app.use(function (req, res) {
    res.status(404).json({
        success: false,
        message: "Endpoint not found."
    });
});
exports.default = app;
