
import esbuild from 'esbuild';

async function buildTests() {
    try {
        await esbuild.build({
            entryPoints: ['chess.test.js'],
            bundle: true,
            outfile: 'test.bundle.js',
            format: 'esm',
        });
        console.log("Tests bundled successfully.");
    } catch (error) {
        console.error("Error bundling tests:", error);
        process.exit(1);
    }
}

buildTests();
