// finds all shadow rots iiin th edoc and flattens them so that the stripper can see the inside components

export const getShadowRoots = (root = document) =>{

    const roots = [];

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        null,
    );

    let n;

    while(n = walker.nextNode()){

        if(n.shadowRoot){
            roots.push(n.shadowRoot);

            roots.push(...getShadowRoots(n.shadowRoot));
        }
    }

    return roots;
}