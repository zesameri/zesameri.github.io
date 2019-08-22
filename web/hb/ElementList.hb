<table>
    <tbody>
        {{#each mData}}
        <tr>
            <td>{{this.mTitle}}</td>
            <td><button class="ElementList-editbtn" data-value="{{this.mId}}">Edit</button></td>
            <td><button class="ElementList-delbtn" data-value="{{this.mId}}">Delete</button></td>
        </tr>
        {{/each}}
    </tbody>
</table>
