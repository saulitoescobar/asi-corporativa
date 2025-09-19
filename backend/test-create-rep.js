const db = require('./models');

async function testCreateRepresentative() {
  try {
    console.log('Testing legal representative creation...');
    
    // Datos de prueba
    const testData = {
      firstName: "Henry Eduardo",
      lastName: "Méndez Sagastume", 
      cui: "5544123456789",
      birthDate: "1994-07-29",
      profession: "Lic en Derecho",
      companyId: 7,
      startDate: "2025-01-02"
    };
    
    console.log('Test data:', testData);
    
    // Verificar que la empresa existe
    console.log('Checking if company exists...');
    const company = await db.Company.findByPk(testData.companyId);
    console.log('Company found:', company ? company.name : 'NOT FOUND');
    
    if (!company) {
      console.log('ERROR: Company not found');
      return;
    }
    
    // Verificar si ya existe un representante con el mismo CUI
    console.log('Checking existing representative...');
    const existingRep = await db.LegalRepresentative.findOne({ 
      where: { cui: testData.cui }
    });
    console.log('Existing representative:', existingRep ? existingRep.firstName + ' ' + existingRep.lastName : 'NOT FOUND');
    
    let representative;
    
    if (existingRep) {
      representative = existingRep;
      console.log('Using existing representative');
    } else {
      console.log('Creating new representative...');
      representative = await db.LegalRepresentative.create({
        firstName: testData.firstName,
        lastName: testData.lastName,
        cui: testData.cui,
        birthDate: testData.birthDate,
        profession: testData.profession
      });
      console.log('Representative created with ID:', representative.id);
    }
    
    // Crear el período
    console.log('Creating period...');
    const period = await db.LegalRepCompanyPeriod.create({
      legalRepresentativeId: representative.id,
      companyId: testData.companyId,
      startDate: testData.startDate,
      endDate: null,
      isActive: true
    });
    console.log('Period created with ID:', period.id);
    
    console.log('SUCCESS: Representative and period created successfully');
    
  } catch (error) {
    console.error('ERROR in test:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testCreateRepresentative();