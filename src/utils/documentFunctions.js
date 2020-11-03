export function setInnerHTML(ofKind, name, value) {
    if (ofKind == 'id') {
        document.getElementById(name).innerHTML = value;
    } else if (ofKind == 'class') {
        document.getElementsByClassName(name)[0].innerHTML = value;
    }
}

export function setInnerHTMLToObject(object, value) {
    object.innerHTML = value;
}

export function setValue(ofKind, name, value) {
    if (ofKind == 'id') {
        document.getElementById(name).value = value;
    } else if (ofKind == 'class') {
        document.getElementsByClassName(name)[0].value = value;
    }
}

export function generateElement(ofKind, id, className) {
    var newElement = document.createElement(ofKind);
    if (id != '') newElement.id = id;
    else if (className != '') newElement.className = className;
    return newElement;
}

export function toggleClass(id, toggledValue) {
    document.getElementById(id).classList.toggle(toggledValue);
}

export function includesClass(id, searchedClass) {
    return document.getElementById(id).classList.value.includes(searchedClass);
}

export function setElementsWidth(id, value) {
    document.getElementById(id).style.width = value;
}

export function setElementsHeight(id, value) {
    document.getElementById(id).style.height = value;
}