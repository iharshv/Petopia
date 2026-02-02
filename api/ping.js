module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
        status: 'ok',
        message: 'Petopia API is alive!',
        time: new Date().toISOString()
    });
};
