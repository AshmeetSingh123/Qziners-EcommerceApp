//Catches errors from an Async call
//Here 'theFunction' is actually the function that is being called in the main program
module.exports = (theFunction) => (req,res,next) => {
    Promise.resolve(theFunction(req,res,next)).catch(next);
};