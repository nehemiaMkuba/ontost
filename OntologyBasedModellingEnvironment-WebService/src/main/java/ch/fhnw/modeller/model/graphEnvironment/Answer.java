package ch.fhnw.modeller.model.graphEnvironment;

public class Answer {
private String id;
private String label;
private String parentElement;

public Answer() {

}

public String getId() {
	return id;
}
public void setId(String id) {
	this.id = id;
}
public String getLabel() {
	return label;
}
public void setLabel(String label) {
	this.label = label;
}

public String getParentElement() {
	return parentElement;
}

public void setParentElement(String parentElement) {
	this.parentElement = parentElement;
}

}
