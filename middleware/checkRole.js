const checkRole = (...roles) => {
    return (req, res, next) =>{
        const userRole = req.session.user?.role;
        if (userRole && roles.includes(userRole)) {
            next();
        } else {
            res.status(403).send("Akses Ditolak");
        }
    }
};
module.exports = checkRole;