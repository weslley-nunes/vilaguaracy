const fs = require('fs');

let builderCode = fs.readFileSync('src/app/(dashboard)/builder/page.js', 'utf8');

// Update fetch request
const fetchRegex = /body: JSON\.stringify\(\{ topic: `\$\{subject\} - \$\{topic\}`\, difficulty, level, year \}\),/;
builderCode = builderCode.replace(fetchRegex, `body: JSON.stringify({ topic: \`\${subject} - \${topic}\`, difficulty, level, year, isContextualized }),`);

// Add UI Checkbox before the Generate buttons
const btnRegex = /<div className="flex gap-2">[\s\S]*?<button type="submit"/;
const btnReplacement = `<div className="flex items-center gap-2 mb-4 bg-vg-light/30 p-3 rounded-lg border border-vg-light/50">
                              <input 
                                  type="checkbox" 
                                  id="isContextualized" 
                                  checked={isContextualized} 
                                  onChange={(e) => setIsContextualized(e.target.checked)} 
                                  className="w-4 h-4 text-vg-dark bg-white border-gray-300 rounded focus:ring-vg-dark focus:ring-2 cursor-pointer"
                              />
                              <label htmlFor="isContextualized" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                  Gerar questões contextualizadas (situação-problema)
                              </label>
                          </div>
                          <div className="flex gap-2">
                              <button type="submit"`;
builderCode = builderCode.replace(btnRegex, btnReplacement);

fs.writeFileSync('src/app/(dashboard)/builder/page.js', builderCode, 'utf8');
console.log("Builder page updated successfully.");
