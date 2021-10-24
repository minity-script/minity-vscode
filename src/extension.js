const vscode = require('vscode');
const { findError } = require('@minity/parser');

function activate(context) {
	/*
	let disposable = vscode.commands.registerCommand('minity.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from minity!');
	});
	context.subscriptions.push(disposable);
	*/
  const minityDiagnostics = vscode.languages.createDiagnosticCollection("minity");
  context.subscriptions.push(minityDiagnostics);
  subscribeToDiagnostics(context,minityDiagnostics);
}


// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

const MINITY_ERROR = 'minity_error';

function refreshDiagnostics(doc, collection)  {
	if (doc.languageId !== "minity") return;
	const diagnostics = [];

  const text = doc.getText();
  const error = findError(text,{file:doc.uri.fsPath});
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
	diagnostic.code = MINITY_ERROR;
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