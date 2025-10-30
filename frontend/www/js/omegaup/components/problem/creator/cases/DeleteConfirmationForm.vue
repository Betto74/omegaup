<template>
  <b-collapse :visible="visible" class="w-100 mt-2">
    <form enctype="multipart/form-data" method="post" @submit="onSubmit">
      <div class="p-3 border rounded bg-light item-active-for-delete">
        <b-form-group
          :label="T.problemEditCommitMessage"
          label-for="commit-input-delete"
          label-size="sm"
          class="mb-2"
        >
          <b-form-input
            id="commit-input-delete"
            v-model="commitMessage"
            size="sm"
            autocomplete="off"
            required
          />
        </b-form-group>

        <!-- Campos hidden del formulario -->
        <input type="hidden" name="request" value="delete" />
        <input type="hidden" name="problem_alias" :value="alias" />
        <input type="hidden" name="message" :value="commitMessage" />
        <input type="hidden" name="contents" :value="contentsPayload" />

        <div class="d-flex flex-column flex-sm-row">
          <b-button
            size="sm"
            variant="danger"
            type="submit"
            :disabled="commitMessage === ''"
            class="w-100 w-sm-auto mb-2 mb-sm-0" >
            {{ 'Confirmar eliminación' }}
          </b-button>
          
          <b-button
            size="sm"
            variant="secondary"
            type="button"
            @click="handleCancel"
            class="w-100 w-sm-auto ml-sm-2" >
            {{ 'Cancelar' }}
          </b-button>
        </div>
      </div>
    </form>
  </b-collapse>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Inject } from 'vue-property-decorator';
import T from '../../../../lang';

@Component
export default class DeleteConfirmationForm extends Vue {
  @Inject('problemAlias') readonly alias!: string;
  
  @Prop({ required: true, type: Boolean }) visible!: boolean;
  @Prop({ required: true, type: String }) itemName!: string;
  @Prop({ required: true, type: Function }) onCancel!: () => void;

  T = T;
  commitMessage: string = '';

  // Actualizar el mensaje cuando visible cambia
  @Watch('visible')
  onVisibleChange(newValue: boolean) {
    if (newValue) {
      this.commitMessage = `Eliminando ${this.itemName}`;
    } else {
      this.commitMessage = '';
    }
  }

  get contentsPayload(): string {
    return JSON.stringify({
      name: this.itemName,
    });
  }

  onSubmit(e: Event) {
    if (!this.commitMessage.trim()) {
      e.preventDefault();
      alert('El mensaje de commit es obligatorio.');
      return;
    }
    // El formulario se enviará naturalmente con POST
  }

  handleCancel() {
    this.onCancel();
    this.commitMessage = '';
  }
}
</script>

<style lang="scss" scoped>
.item-active-for-delete {
  border-left: 3px solid #dc3545 !important;
}
</style>