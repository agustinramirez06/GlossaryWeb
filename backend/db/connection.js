import mongoose from "mongoose";

const url = "mongodb://localhost:27017/glossaryWeb";

export async function connectDB() {
  try {
    await mongoose.connect(url);
    console.log("✅ Conectado a MongoDB");
        return mongoose.connection;
  } catch (err) {
    console.error("❌ Error de conexión:", err);
  }
}

const definitionSchema = mongoose.Schema({
    termino: { type: String, required: true },
    definicion: { type: String, required: true },
}, {versionKey: false});

export const DefinitionModel = mongoose.models.Definition || mongoose.model("Definition", definitionSchema);



const showDefinitions = async () => {
    const definitions = await DefinitionModel.find({});
    console.log(definitions);
};

const createDefinitions = async (termino, definicion) => {
    const definitions = new DefinitionModel({
        termino: termino,
        definicion: definicion
    })
    await definitions.save()
    
}

const updateDefinitions = async (id,termino,definicion) => {

    const definitions = await DefinitionModel.updateOne({ _id: id },
        {
        $set: {
            termino: termino,
            definicion: definicion
        }
    });
    console.log(definitions);
};

const deleteDefinitions = async (id) => {
    const definitions = await DefinitionModel.deleteOne({ _id: id });
    console.log(definitions);
};

export async function disconnectDB() {
    try {
        await mongoose.disconnect();
        console.log('✅ Desconectado de MongoDB');
    } catch (err) {
        console.error('❌ Error al desconectar:', err);
    }
}

// No ejecutar lógica al importar este módulo. Las funciones auxiliares
// (createDefinitions, showDefinitions, etc.) se mantienen para uso manual.