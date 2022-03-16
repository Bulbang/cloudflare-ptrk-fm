try {
    throw {asd: 200}
    console.log(1);
} catch (error) {
    console.log(error.asd);
    
}