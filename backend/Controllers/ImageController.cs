using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.RegularExpressions;
using System.Text;
using System.Collections.Generic;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _uploadDir;
        private const long MAX_STORAGE = 5L * 1024 * 1024 * 1024; // 5GB

        public ImageController(IWebHostEnvironment env)
        {
            _env = env;
            _uploadDir = Path.Combine(_env.ContentRootPath, "upload", "image");

            if (!Directory.Exists(_uploadDir))
            {
                Directory.CreateDirectory(_uploadDir);
            }
        }

        private string SafePath(string p)
        {
            if (string.IsNullOrEmpty(p)) return "";
            // Keep normalize and prevent directory traversal
            var normalized = p.Replace('\\', '/');
            if (normalized.Contains("../") || normalized.Contains("..\\"))
            {
                return ""; // or throw
            }
            return normalized.TrimStart('/');
        }

        private string RemoveVietnameseTones(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";

            var ext = Path.GetExtension(text);
            var name = Path.GetFileNameWithoutExtension(text);

            string cleanName = name.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var c in cleanName)
            {
                var uc = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (uc != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }
            cleanName = sb.ToString().Normalize(NormalizationForm.FormC);

            // Manual mapping
            cleanName = Regex.Replace(cleanName, "[đĐ]", "d");
            cleanName = Regex.Replace(cleanName, "[áàảãạăắằẳẵặâấầẩẫậ]", "a", RegexOptions.IgnoreCase);
            cleanName = Regex.Replace(cleanName, "[éèẻẽẹêếềểễệ]", "e", RegexOptions.IgnoreCase);
            cleanName = Regex.Replace(cleanName, "[íìỉĩị]", "i", RegexOptions.IgnoreCase);
            cleanName = Regex.Replace(cleanName, "[óòỏõọôốồổỗộơớờởỡợ]", "o", RegexOptions.IgnoreCase);
            cleanName = Regex.Replace(cleanName, "[úùủũụưứừửữự]", "u", RegexOptions.IgnoreCase);
            cleanName = Regex.Replace(cleanName, "[ýỳỷỹỵ]", "y", RegexOptions.IgnoreCase);
            cleanName = cleanName.ToLower();

            // Final Slugification
            cleanName = Regex.Replace(cleanName, @"[^\w\s-]", "");
            cleanName = cleanName.Trim();
            cleanName = Regex.Replace(cleanName, @"\s+", "_");
            cleanName = Regex.Replace(cleanName, @"_+", "_");
            cleanName = cleanName.Trim('_');

            return string.IsNullOrEmpty(ext) ? cleanName : $"{cleanName}{ext}";
        }

        [HttpGet("list")]
        public IActionResult List([FromQuery] string folder = "")
        {
            var folderPath = SafePath(folder);
            var dir = Path.Combine(_uploadDir, folderPath);

            var folders = new List<object>();
            var files = new List<object>();

            if (!Directory.Exists(dir))
            {
                return Ok(new { folders, files, currentFolder = folderPath });
            }

            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            foreach (var d in Directory.GetDirectories(dir))
            {
                var name = Path.GetFileName(d);
                var rel = string.IsNullOrEmpty(folderPath) ? name : $"{folderPath}/{name}";
                folders.Add(new { name = name, path = rel });
            }

            foreach (var f in Directory.GetFiles(dir))
            {
                var name = Path.GetFileName(f);
                if (name.StartsWith(".")) continue;

                var rel = string.IsNullOrEmpty(folderPath) ? name : $"{folderPath}/{name}";
                var info = new FileInfo(f);

                files.Add(new
                {
                    name = name,
                    path = rel,
                    size = info.Length,
                    url = $"{baseUrl}/upload/image/{rel}"
                });
            }

            return Ok(new { folders, files, currentFolder = folderPath });
        }

        [HttpPost("upload")]
        [RequestSizeLimit(100_000_000)] // ~100MB roughly to allow 10x 10MB images
        public async Task<IActionResult> Upload([FromQuery] string folder = "", [FromForm] List<IFormFile> files = null)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { success = false, error = "Không có file nào được tải lên" });
            }

            var folderPath = SafePath(folder);
            var dir = Path.Combine(_uploadDir, folderPath);

            if (!Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var uploadedFiles = new List<object>();

            foreach (var file in files)
            {
                if (!file.ContentType.StartsWith("image/"))
                {
                    return BadRequest(new { success = false, error = "Chỉ cho phép upload file ảnh" });
                }

                var cleanName = RemoveVietnameseTones(file.FileName);
                var fullPath = Path.Combine(dir, cleanName);

                // Avoid overwriting by appending timestamp if exists
                if (System.IO.File.Exists(fullPath))
                {
                    var nameOnly = Path.GetFileNameWithoutExtension(cleanName);
                    var ext = Path.GetExtension(cleanName);
                    cleanName = $"{nameOnly}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}{ext}";
                    fullPath = Path.Combine(dir, cleanName);
                }

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var rel = string.IsNullOrEmpty(folderPath) ? cleanName : $"{folderPath}/{cleanName}";
                uploadedFiles.Add(new
                {
                    name = cleanName,
                    path = rel,
                    size = file.Length,
                    url = $"{baseUrl}/upload/image/{rel}"
                });
            }

            return Ok(new { success = true, files = uploadedFiles });
        }

        public class CreateDto { public string Name { get; set; } public string Parent { get; set; } }

        [HttpPost("create")]
        public IActionResult Create([FromBody] CreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { error = "Tên folder rỗng" });

            var parentPath = SafePath(dto.Parent);
            var cleanName = RemoveVietnameseTones(dto.Name.Trim());
            var dir = Path.Combine(_uploadDir, parentPath, cleanName);

            if (Directory.Exists(dir)) return BadRequest(new { error = "Folder đã tồn tại" });

            Directory.CreateDirectory(dir);
            return Ok(new { success = true, name = cleanName });
        }

        public class RenameDto { public string OldPath { get; set; } public string NewName { get; set; } }

        [HttpPost("rename")]
        public IActionResult Rename([FromBody] RenameDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.OldPath) || string.IsNullOrWhiteSpace(dto.NewName))
                return BadRequest(new { error = "Thiếu dữ liệu" });

            var oldPath = SafePath(dto.OldPath);
            var cleanNewName = RemoveVietnameseTones(dto.NewName.Trim());

            var oldFull = Path.Combine(_uploadDir, oldPath);
            var newFull = Path.Combine(Path.GetDirectoryName(oldFull), cleanNewName);

            if (!System.IO.File.Exists(oldFull) && !Directory.Exists(oldFull))
                return NotFound(new { error = "Nguồn không tồn tại" });

            if (System.IO.File.Exists(newFull) || Directory.Exists(newFull))
                return BadRequest(new { error = "Tên mới đã tồn tại" });

            if (Directory.Exists(oldFull))
                Directory.Move(oldFull, newFull);
            else
                System.IO.File.Move(oldFull, newFull);

            return Ok(new { success = true, newName = cleanNewName });
        }

        public class MoveDto { public string Source { get; set; } public string Target { get; set; } }

        [HttpPost("move")]
        public IActionResult Move([FromBody] MoveDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Source)) return BadRequest(new { error = "Thiếu nguồn di chuyển" });

            var source = SafePath(dto.Source);
            var target = SafePath(dto.Target);

            var from = Path.Combine(_uploadDir, source);
            var targetDir = Path.Combine(_uploadDir, target);
            var to = Path.Combine(targetDir, Path.GetFileName(source));

            if (!System.IO.File.Exists(from) && !Directory.Exists(from))
                return NotFound(new { error = "Nguồn không tồn tại" });

            if (!Directory.Exists(targetDir)) return BadRequest(new { error = "Thư mục đích không tồn tại" });
            if (System.IO.File.Exists(to) || Directory.Exists(to)) return BadRequest(new { error = "Đã tồn tại file/thư mục trùng tên tại đích" });

            if (Directory.Exists(from))
                Directory.Move(from, to);
            else
                System.IO.File.Move(from, to);

            return Ok(new { success = true });
        }

        public class DeleteItemDto { public string Path { get; set; } }
        public class DeleteDto { public List<DeleteItemDto> Items { get; set; } }

        [HttpDelete("delete")]
        public IActionResult Delete([FromBody] DeleteDto dto)
        {
            if (dto.Items == null) return BadRequest(new { error = "Danh sách xóa không hợp lệ" });

            foreach (var item in dto.Items)
            {
                var full = Path.Combine(_uploadDir, SafePath(item.Path));
                if (System.IO.File.Exists(full))
                {
                    System.IO.File.Delete(full);
                }
                else if (Directory.Exists(full))
                {
                    Directory.Delete(full, true);
                }
            }

            return Ok(new { success = true });
        }

        [HttpGet("tree")]
        public IActionResult Tree()
        {
            return Ok(ReadTree(_uploadDir, ""));
        }

        private List<object> ReadTree(string dir, string baseRel)
        {
            var res = new List<object>();
            if (!Directory.Exists(dir)) return res;

            foreach (var d in Directory.GetDirectories(dir))
            {
                var name = Path.GetFileName(d);
                var path = string.IsNullOrEmpty(baseRel) ? name : $"{baseRel}/{name}";
                res.Add(new
                {
                    name = name,
                    path = path,
                    children = ReadTree(Path.Combine(dir, name), path)
                });
            }
            return res;
        }

        [HttpGet("search")]
        public IActionResult Search([FromQuery] string keyword, [FromQuery] string folder = "")
        {
            if (string.IsNullOrWhiteSpace(keyword)) return BadRequest(new { error = "Thiếu từ khóa tìm kiếm" });

            var folderPath = SafePath(folder);
            var dir = Path.Combine(_uploadDir, folderPath);
            var baseUrl = $"{Request.Scheme}://{Request.Host}";

            var files = RecursiveSearch(dir, baseUrl, keyword, folderPath);
            return Ok(new { success = true, files });
        }

        private List<object> RecursiveSearch(string dir, string baseUrl, string keyword, string currentPath)
        {
            var res = new List<object>();
            if (!Directory.Exists(dir)) return res;

            foreach (var d in Directory.GetDirectories(dir))
            {
                var name = Path.GetFileName(d);
                var rel = string.IsNullOrEmpty(currentPath) ? name : $"{currentPath}/{name}";
                res.AddRange(RecursiveSearch(Path.Combine(dir, name), baseUrl, keyword, rel));
            }

            foreach (var f in Directory.GetFiles(dir))
            {
                var name = Path.GetFileName(f);
                if (name.Contains(keyword, System.StringComparison.OrdinalIgnoreCase))
                {
                    var rel = string.IsNullOrEmpty(currentPath) ? name : $"{currentPath}/{name}";
                    var info = new FileInfo(f);
                    res.Add(new
                    {
                        name = name,
                        path = rel,
                        size = info.Length,
                        url = $"{baseUrl}/upload/image/{rel}"
                    });
                }
            }

            return res;
        }

        [HttpGet("storage")]
        public IActionResult Storage()
        {
            var size = GetFolderSize(_uploadDir);
            var percent = (double)size / MAX_STORAGE * 100;

            return Ok(new
            {
                success = true,
                used = size,
                max = MAX_STORAGE,
                usedGB = (size / 1024.0 / 1024.0 / 1024.0).ToString("0.00"),
                maxGB = (MAX_STORAGE / 1024.0 / 1024.0 / 1024.0).ToString("0"),
                percent = percent.ToString("0")
            });
        }

        private long GetFolderSize(string dir)
        {
            if (!Directory.Exists(dir)) return 0;
            
            long size = 0;
            foreach (string file in Directory.GetFiles(dir, "*.*", SearchOption.AllDirectories))
            {
                size += new FileInfo(file).Length;
            }
            return size;
        }
    }
}
