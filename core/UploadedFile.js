module.exports = function(filename,path)
{
	this.filename = filename;
	this.path = path
	this.extention = filename.replace(/.+\.(.+)$/,"$1");
}