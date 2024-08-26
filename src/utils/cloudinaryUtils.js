function getPublicIdFromUrl(url) {
    const regex = /\/image\/upload\/(.*?)(?:[\?\#]|$)/;
    const match = url.match(regex);
    if (match && match[1]) {
        return match[1];
    } else {
        throw new Error('Invalid Cloudinary URL');
    }
}
function formatPublicId(title) {
    // Chuyển đổi thành chữ thường
    // Thay thế các ký tự đặc biệt và khoảng trắng thành dấu gạch ngang
    // Xóa các ký tự không phải chữ cái hoặc số
    return title
        .toLowerCase()                   // Chuyển thành chữ thường
        .replace(/[^a-z0-9\s]/g, '')     // Loại bỏ các ký tự không phải chữ cái hoặc số
        .replace(/\s+/g, '-')            // Thay thế khoảng trắng thành dấu gạch ngang
        .trim();                         // Xóa khoảng trắng ở đầu và cuối
}

module.exports = { getPublicIdFromUrl, formatPublicId }

