import { connectDB, DefinitionModel, disconnectDB } from './connection.js';

async function seedDatabase() {
  try {
    await connectDB();

    // Eliminar documentos corruptos (que contengan "function String" o campos undefined)
    console.log('🧹 Limpiando documentos corruptos...');
    const deleted = await DefinitionModel.deleteMany({
      $or: [
        { termino: { $regex: 'function String', $options: 'i' } },
        { definicion: { $regex: 'function String', $options: 'i' } },
        { termino: 'undefined' },
        { definicion: 'undefined' }
      ]
    });
    console.log(`✅ Eliminados ${deleted.deletedCount} documentos corruptos`);

    // Insertar definiciones válidas de ejemplo
    const seedData = [
      {
        termino: 'JavaScript',
        definicion: 'Lenguaje de programación interpretado que se ejecuta en los navegadores y permite interactividad en páginas web.'
      },
      {
        termino: 'React',
        definicion: 'Biblioteca de JavaScript para construir interfaces de usuario usando componentes reutilizables.'
      },
      {
        termino: 'Node.js',
        definicion: 'Entorno de ejecución de JavaScript en el servidor que permite crear aplicaciones de backend.'
      },
      {
        termino: 'MongoDB',
        definicion: 'Base de datos NoSQL orientada a documentos que almacena datos en formato JSON.'
      },
      {
        termino: 'API',
        definicion: 'Interfaz de programación de aplicaciones que permite que diferentes software se comuniquen entre sí.'
      }
    ];

    console.log('📚 Insertando definiciones de ejemplo...');
    const inserted = await DefinitionModel.insertMany(seedData);
    console.log(`✅ Se insertaron ${inserted.length} definiciones`);

    // Mostrar lo que quedó
    console.log('\n📋 Definiciones actuales en la base de datos:');
    const all = await DefinitionModel.find({});
    all.forEach((def, i) => {
      console.log(`${i + 1}. ${def.termino}: ${def.definicion.substring(0, 50)}...`);
    });

  } catch (err) {
    console.error('❌ Error en seed:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seedDatabase();
