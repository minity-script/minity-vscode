const vscode = require('vscode');
const { findError } = require('@mclang/mclang');

function activate(context) {
	let disposable = vscode.commands.registerCommand('mclang.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from mclang!');
	});
	context.subscriptions.push(disposable);

  const mclangDiagnostics = vscode.languages.createDiagnosticCollection("mclang");
  context.subscriptions.push(mclangDiagnostics);
  subscribeToDiagnostics(context,mclangDiagnostics);
	console.log("We are running")
}


// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

const MCLANG_ERROR = 'mclang_error';

function refreshDiagnostics(doc, collection)  {
	if (doc.languageId !== "mclang") return;
	console.log("We are diagnosticating")
	const diagnostics = [];

  const text = doc.getText();
  const error = findError(text);
	if (error) {
		const { message } = error;
		const { line, column } = error.location.start;
    diagnostics.push(createDiagnostic(line-1,column-1,message));
  }

	collection.set(doc.uri, diagnostics);
}

function createDiagnostic(line, column, message="Syntax error") {
	const range = new vscode.Range(line, column, line, column);

	const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
	diagnostic.code = MCLANG_ERROR;
	return diagnostic;
}

function subscribeToDiagnostics(context, collection) {
	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(vscode.window.activeTextEditor.document, collection);
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				refreshDiagnostics(editor.document, collection);
			}
		}),
    vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, collection)),
    vscode.workspace.onDidCloseTextDocument(doc => collection.delete(doc.uri))
	);

}