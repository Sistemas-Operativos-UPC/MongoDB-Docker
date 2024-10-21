// Connect to MongoDB
const adminUser = process.env.MONGO_INITDB_ROOT_USERNAME;
const adminPassword = process.env.MONGO_INITDB_ROOT_PASSWORD;
const dbName = process.env.MONGO_INITDB_DATABASE;
const appUser = process.env.APP_USER;
const appPassword = process.env.APP_PASSWORD;

// Connect to the 'admin' database
db = db.getSiblingDB('admin');

// Create a user with admin privileges
db.createUser({
    user: appUser,
    pwd: appPassword,
    roles: [
        { role: "readWrite", db: dbName }
    ]
});

// Connect to the application database
db = db.getSiblingDB(dbName);

// Define schemas

const usersSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["name", "email", "password", "role"],
        properties: {
            name: {
                bsonType: "object",
                required: ["first_name", "paternal_last_name", "maternal_last_name"],
                properties: {
                    first_name: {
                        bsonType: "string"
                    },
                    middle_name: {
                        bsonType: "string"
                    },
                    paternal_last_name: {
                        bsonType: "string"
                    },
                    maternal_last_name: {
                        bsonType: "string"
                    }
                }
            },
            email: {
                bsonType: "string",
                pattern: "^.+@.+\\..+$"
            },
            password: {
                bsonType: "string"
            },
            role: {
                enum: ["teacher", "student", "parent"]
            },
            birth_date: {
                bsonType: "date"
            },
            gender: {
                enum: ["male", "female", "other"]
            },
            address: {
                bsonType: "string"
            },
            phone: {
                bsonType: "string"
            },
            educational_institution_id: {
                bsonType: "objectId"
            },
            class_ids: {
                bsonType: "array",
                items: {
                    bsonType: "objectId"
                }
            },
            creation_date: {
                bsonType: "date"
            },
            update_date: {
                bsonType: "date"
            }
        }
    }
};

const educationalInstitutionsSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["name", "address"],
        properties: {
            name: {
                bsonType: "string"
            },
            address: {
                bsonType: "string"
            },
            phone: {
                bsonType: "string"
            },
            email: {
                bsonType: "string",
                pattern: "^.+@.+\\..+$"
            },
            location: {
                bsonType: "object",
                properties: {
                    department: {
                        bsonType: "string"
                    },
                    province: {
                        bsonType: "string"
                    },
                    district: {
                        bsonType: "string"
                    },
                    latitude: {
                        bsonType: "double"
                    },
                    longitude: {
                        bsonType: "double"
                    }
                }
            },
            teacher_ids: {
                bsonType: "array",
                items: {
                    bsonType: "objectId"
                }
            },
            student_ids: {
                bsonType: "array",
                items: {
                    bsonType: "objectId"
                }
            },
            creation_date: {
                bsonType: "date"
            },
            update_date: {
                bsonType: "date"
            }
        }
    }
};

const classesSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["name", "teacher_id", "educational_institution_id"],
        properties: {
            name: {
                bsonType: "string"
            },
            description: {
                bsonType: "string"
            },
            teacher_id: {
                bsonType: "objectId"
            },
            student_ids: {
                bsonType: "array",
                items: {
                    bsonType: "objectId"
                }
            },
            educational_institution_id: {
                bsonType: "objectId"
            },
            resource_ids: {
                bsonType: "array",
                items: {
                    bsonType: "objectId"
                }
            },
            creation_date: {
                bsonType: "date"
            },
            update_date: {
                bsonType: "date"
            }
        }
    }
};

const educationalResourcesSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["title", "type", "teacher_id", "class_id", "file"],
        properties: {
            title: {
                bsonType: "string"
            },
            description: {
                bsonType: "string"
            },
            type: {
                enum: ["document", "video", "audio", "image"],
                description: "Type of educational resource"
            },
            file: {
                bsonType: "object",
                required: ["file_name", "mime_type", "size", "data"],
                properties: {
                    file_name: {
                        bsonType: "string"
                    },
                    mime_type: {
                        bsonType: "string",
                        description: "MIME type of the file (e.g., 'application/pdf', 'video/mp4')"
                    },
                    size: {
                        bsonType: "int",
                        description: "File size in bytes"
                    },
                    data: {
                        bsonType: "binData",
                        description: "Binary data of the file"
                    }
                },
                description: "Information about the attached file"
            },
            class_id: {
                bsonType: "objectId"
            },
            teacher_id: {
                bsonType: "objectId"
            },
            creation_date: {
                bsonType: "date"
            },
            update_date: {
                bsonType: "date"
            }
        },
        additionalProperties: false,
        description: "Stores files directly in the document"
    }
};

const messagesSchema = {
    $jsonSchema: {
        bsonType: "object",
        required: ["content", "sender_id", "recipient_ids", "sent_date"],
        properties: {
            content: {
                bsonType: "string"
            },
            sender_id: {
                bsonType: "objectId"
            },
            recipient_ids: {
                bsonType: "array",
                minItems: 1,
                items: {
                    bsonType: "objectId"
                }
            },
            class_id: {
                bsonType: "objectId"
            },
            sent_date: {
                bsonType: "date"
            },
            read_date: {
                bsonType: "date"
            },
            attachments: {
                bsonType: "array",
                description: "Files attached to the message",
                items: {
                    bsonType: "object",
                    required: ["file_name", "mime_type", "size", "data"],
                    properties: {
                        file_name: {
                            bsonType: "string"
                        },
                        mime_type: {
                            bsonType: "string"
                        },
                        size: {
                            bsonType: "int"
                        },
                        data: {
                            bsonType: "binData"
                        }
                    }
                }
            }
        }
    }
};

// Create collections with schema validation

db.createCollection("users", {
    validator: usersSchema,
    validationLevel: "strict"
});

db.createCollection("educational_institutions", {
    validator: educationalInstitutionsSchema,
    validationLevel: "strict"
});

db.createCollection("classes", {
    validator: classesSchema,
    validationLevel: "strict"
});

db.createCollection("educational_resources", {
    validator: educationalResourcesSchema,
    validationLevel: "strict"
});

db.createCollection("messages", {
    validator: messagesSchema,
    validationLevel: "strict"
});
